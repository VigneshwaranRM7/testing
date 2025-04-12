import httpStatus from "http-status";
import collaboratorService from "../services/collaborator.service";
import catchAsync from "../utils/catch-async";
import analyticsService from "../services/analytics.service";

const handleGetAllStudent = catchAsync(async (req: any, res) => {
    const collaborator = req.collaborator;
    const { tags, search } = req.query;
    const students = await collaboratorService.getAllStudents(collaborator.collaborator_id, tags, search);
    res.status(httpStatus.OK).json({
        success: true,
        message: "Students fetched successfully",
        data: students,
    });
});

const handleGetStudentsAnalytics = catchAsync(async (req: any, res) => {
    const collaborator = req.collaborator;
    const analytics = await analyticsService.getStudentsAnalytics(collaborator.collaborator_id);
    res.status(httpStatus.OK).json({
        success: true,
        message: "Students analytics fetched successfully",
        data: analytics,
    });
});

export default {
    handleGetAllStudent,
    handleGetStudentsAnalytics,
};
