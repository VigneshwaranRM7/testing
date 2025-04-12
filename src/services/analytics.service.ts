import httpStatus from "http-status";
import CollaboratorProductStudentsModel from "../models/collaborator-product-students.model";
import ApiError from "../utils/api-error";
import errorMessageConstants from "../constants/error.constant";
import logger from "../config/logger";
import licenseAndCertificateModel from "../models/license-and-certificate.model";

interface DailyData {
    date: string;
    count: number;
}

const getStudentsAnalytics = async (collaborator_id: string) => {
    try {
        const currentDate = new Date();
        const thirtyDaysAgo = new Date(currentDate);
        thirtyDaysAgo.setDate(currentDate.getDate() - 30);

        const previousPeriodStart = new Date(thirtyDaysAgo);
        previousPeriodStart.setDate(thirtyDaysAgo.getDate() - 30);

        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const firstDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const lastDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

        // Get all analytics in one aggregation pipeline
        const analyticsResults = await CollaboratorProductStudentsModel.aggregate([
            {
                $match: {
                    collaborator_id,
                    is_active: true,
                },
            },
            {
                $lookup: {
                    from: "students",
                    let: { email: "$email" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$email", "$$email"] },
                            },
                        },
                        {
                            $project: {
                                name: 1,
                                profilePictureUrl: 1,
                                studentId: 1,
                                _id: 0,
                            },
                        },
                    ],
                    as: "student",
                },
            },
            {
                $lookup: {
                    from: "license_and_certificates",
                    let: {
                        productId: "$collaborator_product_students_id",
                        studentId: { $arrayElemAt: ["$student.studentId", 0] },
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$credentialId", "$$productId"] },
                                        { $eq: ["$studentId", "$$studentId"] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                isVerified: 1,
                                status: 1,
                                _id: 0,
                            },
                        },
                    ],
                    as: "assessment",
                },
            },
            {
                $facet: {
                    currentPeriodStats: [
                        {
                            $match: {
                                created_at: { $gte: thirtyDaysAgo, $lte: currentDate },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalAssigned: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $in: [
                                                    { $arrayElemAt: ["$assessment.status", 0] },
                                                    ["IN_PROGRESS", "NEED_TO_CLAIM", "VERIFIED"],
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                                totalEarnedBadges: {
                                    $sum: {
                                        $cond: [{ $eq: [{ $arrayElemAt: ["$assessment.status", 0] }, "VERIFIED"] }, 1, 0],
                                    },
                                },
                            },
                        },
                    ],
                    previousPeriodStats: [
                        {
                            $match: {
                                created_at: { $gte: previousPeriodStart, $lt: thirtyDaysAgo },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalAssigned: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $in: [
                                                    { $arrayElemAt: ["$assessment.status", 0] },
                                                    ["IN_PROGRESS", "NEED_TO_CLAIM"],
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                            },
                        },
                    ],
                    currentMonthStats: [
                        {
                            $match: {
                                created_at: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalAssigned: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $in: [
                                                    { $arrayElemAt: ["$assessment.status", 0] },
                                                    ["IN_PROGRESS", "NEED_TO_CLAIM", "VERIFIED"],
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                            },
                        },
                    ],
                    previousMonthStats: [
                        {
                            $match: {
                                created_at: { $gte: firstDayOfPreviousMonth, $lte: lastDayOfPreviousMonth },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalAssigned: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $in: [
                                                    { $arrayElemAt: ["$assessment.status", 0] },
                                                    ["IN_PROGRESS", "NEED_TO_CLAIM", "VERIFIED"],
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                            },
                        },
                    ],
                    totalStats: [
                        {
                            $group: {
                                _id: null,
                                totalAssigned: { $sum: 1 },
                                totalEarnedBadges: {
                                    $sum: {
                                        $cond: [{ $eq: [{ $arrayElemAt: ["$assessment.status", 0] }, "VERIFIED"] }, 1, 0],
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        ]);

        const stats = analyticsResults[0];
        console.log(
            "Debug - First few records:",
            JSON.stringify(analyticsResults[0].currentPeriodStats.slice(0, 2), null, 2)
        );
        console.log("Debug - Sample debug_info:", JSON.stringify(analyticsResults[0].debug_info, null, 2));
        console.log("Stats:", JSON.stringify(stats, null, 2));
        const currentPeriod = stats.currentPeriodStats[0] || { totalAssigned: 0, totalEarnedBadges: 0 };
        const previousPeriod = stats.previousPeriodStats[0] || { totalAssigned: 0, totalEarnedBadges: 0 };
        const currentMonth = stats.currentMonthStats[0] || { totalAssigned: 0 };
        const previousMonth = stats.previousMonthStats[0] || { totalAssigned: 0 };
        const totalStats = stats.totalStats[0] || { totalAssigned: 0, totalEarnedBadges: 0 };

        // Calculate percentage changes
        const calculatePercentageChange = (current: number, previous: number): string => {
            if (previous === 0) return current > 0 ? "+100%" : "0%";
            const change = ((current - previous) / previous) * 100;
            return `${change > 0 ? "+" : ""}${Math.round(change)}%`;
        };

        return {
            total_assigned_students: {
                count: totalStats.totalAssigned,
                percentage: calculatePercentageChange(currentPeriod.totalAssigned, previousPeriod.totalAssigned),
            },
            total_earned_skill_badges_count: {
                count: totalStats.totalEarnedBadges,
                percentage: calculatePercentageChange(currentPeriod.totalEarnedBadges, previousPeriod.totalEarnedBadges),
            },
            current_month_assigned_students: {
                count: currentMonth.totalAssigned,
                percentage: calculatePercentageChange(currentMonth.totalAssigned, previousMonth.totalAssigned),
            },
            last_30_days_change_percentage: {
                count: currentPeriod.totalAssigned,
                percentage: calculatePercentageChange(currentPeriod.totalAssigned, previousPeriod.totalAssigned),
            },
        };
    } catch (error) {
        logger.error("Error in getStudentsAnalytics:", error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.products.errorOccurred);
    }
};

const getAnalyticsByProduct = async (collaborator_id: string, product_id: string) => {
    try {
        // Get monthly student assignments
        const monthlyStudentStats = await CollaboratorProductStudentsModel.aggregate([
            {
                $match: {
                    collaborator_id,
                    product_id,
                    is_active: true,
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$created_at" },
                        month: { $month: "$created_at" },
                    },
                    total_assigned_students: { $sum: 1 },
                },
            },
            {
                $sort: {
                    "_id.year": -1,
                    "_id.month": -1,
                },
            },
            {
                $limit: 12,
            },
        ]);

        // Get monthly certificate stats
        const monthlyCertificateStats = await licenseAndCertificateModel.aggregate([
            {
                $match: {
                    isVerified: true,
                    status: "VERIFIED",
                },
            },
            {
                $lookup: {
                    from: "collaborator_product_students",
                    let: { credId: "$credentialId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$collaborator_product_students_id", "$$credId"] },
                                        { $eq: ["$collaborator_id", collaborator_id] },
                                        { $eq: ["$product_id", product_id] },
                                        { $eq: ["$is_active", true] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "student_assignment",
                },
            },
            {
                $match: {
                    student_assignment: { $ne: [] },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    total_claimed_count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    "_id.year": -1,
                    "_id.month": -1,
                },
            },
            {
                $limit: 12,
            },
            // {
            //     $project: {
            //         _id: 0,
            //     },
            // },
        ]);

        // Add debug logging
        console.log("Debug - monthlyCertificateStats pipeline result:", JSON.stringify(monthlyCertificateStats, null, 2));

        // Format monthly stats with both assignments and claims
        const formattedMonthlyStats = monthlyStudentStats.reduce((acc: Record<string, any>, stat) => {
            const monthName = new Date(stat._id.year, stat._id.month - 1).toLocaleString("default", { month: "short" });
            const certificateStat = monthlyCertificateStats.find(
                (c) => c._id.year === stat._id.year && c._id.month === stat._id.month
            );

            acc[monthName] = {
                total_assigned_students: stat.total_assigned_students,
                total_claimed_count_percentage:
                    stat.total_assigned_students > 0
                        ? Math.round(((certificateStat?.total_claimed_count || 0) / stat.total_assigned_students) * 100)
                        : 0,
            };
            return acc;
        }, {});

        // Calculate overall statistics
        const totalAssignedStudents = monthlyStudentStats.reduce((sum, stat) => sum + stat.total_assigned_students, 0);
        const totalClaimed = monthlyCertificateStats.reduce((sum, stat) => sum + stat.total_claimed_count, 0);
        const overallClaimPercentage =
            totalAssignedStudents > 0 ? Math.round((totalClaimed / totalAssignedStudents) * 100) : 0;

        return {
            total_assigned_students: totalAssignedStudents,
            students_assigned_current_month: monthlyStudentStats[0]?.total_assigned_students || 0,
            claimed_skill_badge_percentage: overallClaimPercentage,
            monthly_stats: formattedMonthlyStats,
        };
    } catch (error) {
        logger.error("Error in getAnalyticsByProduct:", error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.products.errorOccurred);
    }
};

const getOverAllAnalytice = async (collaborator_id: string) => {
    try {
        const currentDate = new Date();
        const thirtyDaysAgo = new Date(currentDate);
        thirtyDaysAgo.setDate(currentDate.getDate() - 30);

        const previousPeriodStart = new Date(thirtyDaysAgo);
        previousPeriodStart.setDate(thirtyDaysAgo.getDate() - 30);

        // Get all analytics in one aggregation pipeline
        const analyticsResults = await CollaboratorProductStudentsModel.aggregate([
            {
                $match: {
                    collaborator_id,
                    is_active: true,
                },
            },
            {
                $lookup: {
                    from: "students",
                    let: { email: "$email" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$email", "$$email"] },
                            },
                        },
                        {
                            $project: {
                                name: 1,
                                profilePictureUrl: 1,
                                studentId: 1,
                                _id: 0,
                            },
                        },
                    ],
                    as: "student",
                },
            },
            {
                $lookup: {
                    from: "license_and_certificates",
                    let: {
                        productId: "$collaborator_product_students_id",
                        studentId: { $arrayElemAt: ["$student.studentId", 0] },
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$credentialId", "$$productId"] },
                                        { $eq: ["$studentId", "$$studentId"] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                isVerified: 1,
                                status: 1,
                                _id: 0,
                            },
                        },
                    ],
                    as: "assessment",
                },
            },
            {
                $facet: {
                    currentPeriodStats: [
                        {
                            $match: {
                                createdAt: { $gte: thirtyDaysAgo, $lte: currentDate },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalStudents: { $sum: 1 },
                                // Count students whose assessment status is either IN_PROGRESS or NEED_TO_CLAIM
                                totalInProgressOrNeedToClaim: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $in: [
                                                    { $arrayElemAt: ["$assessment.status", 0] },
                                                    ["IN_PROGRESS", "NEED_TO_CLAIM", "VERIFIED"],
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                                totalPassedAssessments: {
                                    $sum: {
                                        $cond: [{ $eq: [{ $arrayElemAt: ["$assessment.status", 0] }, "VERIFIED"] }, 1, 0],
                                    },
                                },
                            },
                        },
                    ],
                    previousPeriodStats: [
                        {
                            $match: {
                                createdAt: { $gte: previousPeriodStart, $lt: thirtyDaysAgo },
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalStudents: { $sum: 1 },
                                // Count students whose assessment status is either IN_PROGRESS or NEED_TO_CLAIM
                                totalInProgressOrNeedToClaim: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $in: [
                                                    { $arrayElemAt: ["$assessment.status", 0] },
                                                    ["IN_PROGRESS", "NEED_TO_CLAIM", "VERIFIED"],
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                                totalPassedAssessments: {
                                    $sum: {
                                        $cond: [{ $eq: [{ $arrayElemAt: ["$assessment.status", 0] }, "VERIFIED"] }, 1, 0],
                                    },
                                },
                            },
                        },
                    ],

                    totalStats: [
                        {
                            $group: {
                                _id: null,
                                totalStudents: { $sum: 1 },
                                // Count students whose assessment status is either IN_PROGRESS or NEED_TO_CLAIM
                                totalInProgressOrNeedToClaim: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $in: [
                                                    { $arrayElemAt: ["$assessment.status", 0] },
                                                    ["IN_PROGRESS", "NEED_TO_CLAIM", "VERIFIED"],
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                                totalPassedAssessments: {
                                    $sum: {
                                        $cond: [{ $eq: [{ $arrayElemAt: ["$assessment.status", 0] }, "VERIFIED"] }, 1, 0],
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        ]);

        const stats = analyticsResults[0];

        const currentPeriod = stats.currentPeriodStats[0] || {
            totalStudents: 0,
            totalInProgressOrNeedToClaim: 0,
            totalPassedAssessments: 0,
        };
        const previousPeriod = stats.previousPeriodStats[0] || {
            totalStudents: 0,
            totalInProgressOrNeedToClaim: 0,
            totalPassedAssessments: 0,
        };
        const totalStats = stats.totalStats[0] || {
            totalStudents: 0,
            totalInProgressOrNeedToClaim: 0,
            totalPassedAssessments: 0,
        };

        // Calculate percentage changes
        const calculatePercentageChange = (current: number, previous: number): string => {
            if (previous === 0) return current > 0 ? "+100%" : "0%";
            const change = ((current - previous) / previous) * 100;
            return `${change > 0 ? "+" : ""}${Math.round(change)}%`;
        };

        const totalStudentsChange = calculatePercentageChange(currentPeriod.totalStudents, previousPeriod.totalStudents);
        const totalAssignedChange = calculatePercentageChange(
            currentPeriod.totalInProgressOrNeedToClaim,
            previousPeriod.totalInProgressOrNeedToClaim
        );
        const skillBadgeChange = calculatePercentageChange(
            currentPeriod.totalPassedAssessments,
            previousPeriod.totalPassedAssessments
        );

        return {
            overall_analytics: {
                total_students: {
                    count: totalStats.totalStudents,
                    percentage: totalStudentsChange,
                },
                total_assigned_students: {
                    count: totalStats.totalInProgressOrNeedToClaim,
                    percentage: totalAssignedChange,
                },
                skill_badge_claim_rate: {
                    count: Math.round((totalStats.totalPassedAssessments / totalStats.totalStudents) * 100) || 0,
                    percentage: skillBadgeChange,
                },
            },
        };
    } catch (error) {
        logger.error("Error in getOverAllAnalytice:", error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.products.errorOccurred);
    }
};

const getSocialShareAnalytics = async (collaborator_id: string, days: number) => {
    try {
        // Ensure days is a valid number and default to 30 if not
        const numberOfDays = Number(days) || 30;

        const analyticsResults = await CollaboratorProductStudentsModel.aggregate([
            {
                $match: {
                    collaborator_id,
                    is_active: true,
                },
            },
            {
                $lookup: {
                    from: "social_shares",
                    localField: "collaborator_product_students_id",
                    foreignField: "credentialId",
                    as: "shares",
                },
            },
            {
                $unwind: "$shares",
            },
            {
                $project: {
                    _id: 0,
                    date: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$shares.createdAt",
                        },
                    },
                },
            },
            {
                $group: {
                    _id: "$date",
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    _id: -1,
                },
            },
        ]);

        console.log("Analytics Results:", analyticsResults);

        // Take only the last N days of data
        const limitedResults = analyticsResults.slice(0, numberOfDays);

        // Sort back to ascending order
        limitedResults.sort((a, b) => a._id.localeCompare(b._id));

        // Generate daily data with cumulative counts

        const dailyData: DailyData[] = [];
        let runningTotal = 0; // Starting baseline

        limitedResults.forEach((day) => {
            runningTotal += day.count;
            dailyData.push({
                date: day._id,
                count: runningTotal,
            });
        });

        const startCount = dailyData[0]?.count || 0;
        const endCount = runningTotal;
        const percentageChange = Math.round(((endCount - startCount) / startCount) * 100);

        return {
            total_shares: {
                count: endCount,
                percentage: `${percentageChange > 0 ? "+" : ""}${percentageChange}%`,
            },
            daily_shares: dailyData,
            period_total: endCount - startCount,
        };
    } catch (error) {
        logger.error("Error in getSocialShareAnalytics:", error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.products.errorOccurred);
    }
};

export default {
    getStudentsAnalytics,
    getAnalyticsByProduct,
    getOverAllAnalytice,
    getSocialShareAnalytics,
};
