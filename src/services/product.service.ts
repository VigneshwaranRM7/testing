import httpStatus from "http-status";
import CollaboratorProductsModel from "../models/collaborator-products.model";
import ApiError from "../utils/api-error";
import { errorMessageConstants } from "../constants";
import { generateUUID } from "../helpers/uuid.helper";
import logger from "../config/logger";
import CollaboratorProductStudentsModel from "../models/collaborator-product-students.model";
import csvParser from "csv-parser";
import { Readable } from "stream";
import billingService from "./billing.service";
import emailTemplateModel from "../models/email-template.model";
import emailConstant from "../constants/email.constant";
import authService from "./auth.service";
import ejs from "ejs";

interface CSVRecord {
    name: string;
    email: string;
    [key: string]: string;
}

const isProductExists = async (collaborator_id: string, product_id: string) => {
    const product = await CollaboratorProductsModel.findOne({
        is_active: true,
        collaborator_id,
        product_id,
    });
    return product;
};

const getAllProducts = async (collaborator_id: any) => {
    try {
        const products = await CollaboratorProductsModel.aggregate([
            {
                $match: {
                    is_active: true,
                    collaborator_id: collaborator_id,
                },
            },
            {
                $sort: {
                    created_at: -1,
                },
            },
            {
                $lookup: {
                    from: "collaborator_product_students",
                    localField: "product_id",
                    foreignField: "product_id",
                    as: "total_assigned_students",
                    pipeline: [
                        {
                            $match: {
                                is_active: true,
                            },
                        },
                        {
                            $group: {
                                _id: "$product_id",
                                count: { $sum: 1 },
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "skills",
                    let: { skill_badges: "$skill_badges" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$isActive", true] }, { $in: ["$skillId", "$$skill_badges"] }],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                skillId: 1,
                                name: 1,
                            },
                        },
                    ],
                    as: "skill_badges",
                },
            },
            {
                $lookup: {
                    from: "collaborator_product_tags",
                    let: { product_tags: "$product_tags" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$is_active", true] }, { $in: ["$tag_id", "$$product_tags"] }],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                tag_name: 1,
                                tag_id: 1,
                            },
                        },
                    ],
                    as: "product_tags",
                },
            },
            {
                $project: {
                    _id: 1,
                    product_id: 1,
                    product_title: 1,
                    product_description: 1,
                    product_duration: 1,
                    product_price: 1,
                    product_tags: 1,
                    product_type: 1,
                    product_mode: 1,
                    product_currency: 1,
                    product_thumbnail: 1,
                    product_brochure_or_details: 1,
                    trigger_assessment: 1,
                    product_link: 1,
                    skill_badges: 1,
                    total_assigned_students: { $arrayElemAt: ["$total_assigned_students.count", 0] },
                },
            },
        ]);
        return products;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.products.failedToFetchProducts);
    }
};

const getProductById = async (collaborator_id: any, product_id: any) => {
    try {
        const isExists = await isProductExists(collaborator_id, product_id);
        if (!isExists) {
            throw new ApiError(httpStatus.NOT_FOUND, errorMessageConstants.products.productNotFound);
        }

        const product = await CollaboratorProductsModel.aggregate([
            {
                $match: {
                    is_active: true,
                    collaborator_id: collaborator_id,
                    product_id: product_id,
                },
            },
            {
                $lookup: {
                    from: "collaborator_product_students",
                    localField: "product_id",
                    foreignField: "product_id",
                    as: "total_assigned_students",
                    pipeline: [
                        {
                            $match: {
                                is_active: true,
                            },
                        },
                        {
                            $group: {
                                _id: "$product_id",
                                count: { $sum: 1 },
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "skills",
                    let: { skill_badges: "$skill_badges" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$isActive", true] }, { $in: ["$skillId", "$$skill_badges"] }],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                skillId: 1,
                                name: 1,
                            },
                        },
                    ],
                    as: "skill_badges",
                },
            },
            {
                $lookup: {
                    from: "collaborator_product_tags",
                    let: { product_tags: "$product_tags" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$is_active", true] }, { $in: ["$tag_id", "$$product_tags"] }],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                tag_name: 1,
                                tag_id: 1,
                            },
                        },
                    ],
                    as: "product_tags",
                },
            },
            {
                $project: {
                    _id: 0,
                    is_active: 1,
                    product_brochure_or_details: 1,
                    trigger_assessment: 1,
                    product_link: 1,
                    product_duration: 1,
                    product_currency: 1,
                    product_price: 1,
                    product_type: 1,
                    product_mode: 1,
                    product_description: 1,
                    product_tags: 1,
                    product_title: 1,
                    product_thumbnail: 1,
                    product_id: 1,
                    collaborator_id: 1,
                    skill_badges: 1,
                    total_assigned_students: { $arrayElemAt: ["$total_assigned_students.count", 0] },
                },
            },
        ]).then((product) => {
            return product[0];
        });

        if (!product) {
            throw new ApiError(httpStatus.NOT_FOUND, errorMessageConstants.products.productNotFound);
        }
        return product;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.products.failedToFetchProduct);
    }
};

const createProduct = async (collaborator_id: string, product_data: any) => {
    try {
        logger.info("Creating product with data:", JSON.stringify(product_data, null, 2));

        // Ensure arrays are properly handled
        const productTags = Array.isArray(product_data.product_tags)
            ? product_data.product_tags
            : (product_data.product_tags || "")
                  .split(",")
                  .filter(Boolean)
                  .map((tag: string) => tag.trim());

        const skillBadges = Array.isArray(product_data.skill_badges)
            ? product_data.skill_badges
            : (product_data.skill_badges || "")
                  .split(",")
                  .filter(Boolean)
                  .map((badge: string) => badge.trim());

        const product = await CollaboratorProductsModel.create({
            ...product_data,
            product_id: generateUUID(),
            collaborator_id,
            is_active: true,
            product_tags: productTags,
            skill_badges: skillBadges,
        });
        return product;
    } catch (error) {
        // Type assertion since we know this is a Mongoose/MongoDB error
        const err = error as Error & {
            errors?: { [key: string]: { message: string } };
            code?: number;
        };

        logger.error("Error creating product. Full error:", {
            error: err.toString(),
            stack: err.stack,
            details: err.errors ? JSON.stringify(err.errors) : undefined,
            message: err.message,
            name: err.name,
        });

        // Handle Mongoose validation errors
        if (err.name === "ValidationError" && err.errors) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                `Validation failed: ${Object.values(err.errors)
                    .map((e) => e.message)
                    .join(", ")}`
            );
        }

        // Handle other specific errors
        if (err.name === "MongoServerError" && err.code === 11000) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Duplicate key error");
        }

        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.products.failedToCreateProduct);
    }
};

const updateProduct = async (collaborator_id: string, product_id: string, product_data: any) => {
    try {
        const isExists = await isProductExists(collaborator_id, product_id);
        if (!isExists) {
            throw new ApiError(httpStatus.NOT_FOUND, errorMessageConstants.products.productNotFound);
        }
        logger.info("Updating product with data:", JSON.stringify(product_data, null, 2));

        const updateData = { ...product_data };
        // Transform data types
        if (updateData.trigger_assessment) {
            updateData.trigger_assessment = updateData.trigger_assessment === "true";
        }
        if (updateData.product_price) {
            updateData.product_price = Number(updateData.product_price);
        }
        if (updateData.product_duration) {
            updateData.product_duration = updateData.product_duration;
        }
        if (updateData.product_type) {
            updateData.product_type = updateData.product_type;
        }

        // Handle arrays if they exist in update data
        if (updateData.product_tags) {
            updateData.product_tags = Array.isArray(updateData.product_tags)
                ? updateData.product_tags
                : updateData.product_tags
                      .split(",")
                      .filter(Boolean)
                      .map((tag: string) => tag.trim());
        }

        if (updateData.skill_badges) {
            updateData.skill_badges = Array.isArray(updateData.skill_badges)
                ? updateData.skill_badges
                : updateData.skill_badges
                      .split(",")
                      .filter(Boolean)
                      .map((badge: string) => badge.trim());
        }

        const product = await CollaboratorProductsModel.findOneAndUpdate(
            { product_id, collaborator_id, is_active: true },
            updateData,
            { new: true, runValidators: true }
        );

        if (!product) {
            throw new ApiError(httpStatus.NOT_FOUND, errorMessageConstants.products.productNotFound);
        }

        return product;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.products.failedToUpdateProduct);
    }
};

const deleteProduct = async (collaborator_id: string, product_id: string) => {
    try {
        const isExists = await isProductExists(collaborator_id, product_id);
        if (!isExists) {
            throw new ApiError(httpStatus.NOT_FOUND, errorMessageConstants.products.productNotFound);
        }

        const product = await CollaboratorProductsModel.deleteOne({ product_id, collaborator_id });

        if (!product) {
            throw new ApiError(httpStatus.NOT_FOUND, errorMessageConstants.products.productNotFound);
        }

        return product;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.products.failedToDeleteProduct);
    }
};

const getStudentDetailsFromCSV = async (csvFile: Express.Multer.File): Promise<any> => {
    try {
        if (!csvFile) {
            throw new ApiError(httpStatus.BAD_REQUEST, "CSV file is required");
        }

        if (!csvFile.buffer) {
            throw new ApiError(httpStatus.BAD_REQUEST, "CSV file content is missing");
        }

        return new Promise((resolve, reject) => {
            const students: any[] = [];
            let in_list_duplicates = 0;
            let total_students = 0;
            const stream = Readable.from(csvFile.buffer);

            stream
                .pipe(csvParser())
                .on("data", (record: CSVRecord) => {
                    const name = record?.name || record?.Name;
                    const email = record?.email?.toLowerCase() || record?.Email?.toLowerCase();

                    // Validate each record
                    if (!name || !email) {
                        logger.warn(`Skipping record: Missing required fields`, { record });
                        return;
                    }

                    // Validate email format
                    if (!email.includes("@")) {
                        logger.warn(`Skipping record: Invalid email format`, { email });
                        return;
                    }

                    // Increment total_students for every valid record
                    total_students++;

                    const isStudentExists = students.find((student) => student.email === email);

                    if (isStudentExists) {
                        logger.warn(`Skipping record: Duplicate email`, { email });
                        in_list_duplicates++;
                        return;
                    }

                    students.push({
                        name,
                        email,
                        student_id: generateUUID(),
                    });
                })
                .on("end", () => {
                    if (students.length === 0) {
                        reject(new ApiError(httpStatus.BAD_REQUEST, "No valid student records found in CSV"));
                        return;
                    }
                    logger.info(`Successfully parsed ${students.length} student records`);
                    logger.debug("Parsed student details:", JSON.stringify(students, null, 2));
                    resolve({ students, in_list_duplicates, total_students });
                });
        });
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        logger.error("Error processing CSV:", error);
        throw new ApiError(httpStatus.BAD_REQUEST, errorMessageConstants.products.invalidCSVFile);
    }
};

const initializeAssignProductToStudent = async (collaborator: any, students: any, product_id: string, student_tags: any) => {
    try {
        logger.info(`${product_id} ${collaborator.collaborator_id}`);

        const [activePlan, product] = await Promise.all([
            billingService.getActivePlan(collaborator.collaborator_id),
            CollaboratorProductsModel.findOne({
                collaborator_id: collaborator.collaborator_id,
                product_id,
                is_active: true,
            }),
        ]);

        if (!activePlan) {
            //! Don't change the message here its used in frontend
            throw new ApiError(httpStatus.BAD_REQUEST, "No active plan found");
        }

        if (!product) {
            throw new ApiError(httpStatus.NOT_FOUND, errorMessageConstants.products.productNotFound);
        }

        // Get all existing student records with their payment status
        const existingStudents = await CollaboratorProductStudentsModel.aggregate([
            {
                $match: {
                    product_id: product.product_id,
                    is_active: true,
                },
            },
            {
                $lookup: {
                    from: "collaborator_payments",
                    localField: "payment_id",
                    foreignField: "payment_id",
                    as: "payment",
                    pipeline: [
                        {
                            $match: {
                                is_active: true,
                            },
                        },
                    ],
                },
            },
            {
                $project: {
                    email: 1,
                    payment_status: {
                        $cond: {
                            if: { $gt: [{ $size: "$payment" }, 0] },
                            then: { $arrayElemAt: ["$payment.status", 0] },
                            else: "NO_PAYMENT",
                        },
                    },
                },
            },
        ]);

        logger.info("Existing students with payment status:", JSON.stringify(existingStudents, null, 2));

        // Create a set of emails that have successful payments
        const existingEmailsWithSuccessPayment = new Set(
            existingStudents
                .filter((student) => student.payment_status === "SUCCESS")
                .map((student) => student.email.toLowerCase())
        );

        // Filter out students who already have successful payments
        const newStudents = students.filter(
            (student: any) => !existingEmailsWithSuccessPayment.has(student.email.toLowerCase())
        );

        logger.info(`Number of new students to be assigned: ${newStudents.length}`);

        if (newStudents.length === 0) {
            throw new ApiError(httpStatus.BAD_REQUEST, "All students in the csv file are already assigned to this product");
        }

        const payment = await billingService.createPaymentOrder(
            collaborator.collaborator_id,
            product.product_id,
            newStudents.length
        );

        if (!payment) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Failed to create payment order");
        }

        logger.info(`Payment created successfully: ${payment.payment_id}`);

        const bulkInsertData = newStudents.map((student: any) => ({
            student_id: student.student_id,
            name: student.name,
            email: student.email.toLowerCase(),
            product_id: product.product_id,
            collaborator_id: collaborator.collaborator_id,
            is_active: true,
            collaborator_product_students_id: generateUUID(),
            collaborator_student_tags: student_tags,
            payment_id: payment.payment_id,
        }));

        const result = await CollaboratorProductStudentsModel.insertMany(bulkInsertData);
        logger.info("Product assigned to new students successfully", JSON.stringify(result, null, 2));

        return payment;
    } catch (error) {
        logger.error("Error assigning product to students:", error);
        if (error instanceof ApiError) {
            throw error.statusCode === 400
                ? error
                : new ApiError(
                      httpStatus.INTERNAL_SERVER_ERROR,
                      errorMessageConstants.products.failedToAssignProductToStudent
                  );
        }
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.products.failedToAssignProductToStudent);
    }
};

const completeAssignProductToStudent = async (
    collaborator: any,
    payment_id: any,
    razorpay_details: any,
    product_id: any
) => {
    try {
        await billingService.verifyPayment(payment_id, razorpay_details);

        // Delete student records with failed or pending payments for this product
        await CollaboratorProductStudentsModel.aggregate([
            {
                $match: {
                    product_id,
                    is_active: true,
                    $and: [
                        {
                            payment_id: {
                                $exists: true,
                                $ne: null,
                            },
                        },
                        {
                            payment_id: { $ne: payment_id },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "collaborator_payments",
                    localField: "payment_id",
                    foreignField: "payment_id",
                    as: "payment",
                    pipeline: [
                        {
                            $match: {
                                is_active: true,
                                status: { $in: ["PENDING", "FAILED"] },
                            },
                        },
                    ],
                },
            },
            {
                $match: {
                    "payment.0": { $exists: true },
                },
            },
        ]).then(async (studentsToDelete) => {
            if (studentsToDelete.length > 0) {
                const studentIds = studentsToDelete.map((s) => s.collaborator_product_students_id);
                await CollaboratorProductStudentsModel.deleteMany({
                    collaborator_product_students_id: { $in: studentIds },
                });
                logger.info(`Deleted ${studentsToDelete.length} student records with failed/pending payments`);
            }
        });

        const emailTemplateResponse = await emailTemplateModel.findOne({
            name: emailConstant.emailTemplate.productAssignmentEmailTemplate,
        });

        if (!emailTemplateResponse) {
            throw new ApiError(httpStatus.NOT_FOUND, errorMessageConstants.products.emailTemplateNotFound);
        }

        const [product, collaboratorStudents] = await Promise.all([
            CollaboratorProductsModel.findOne({
                product_id,
                is_active: true,
            }),
            CollaboratorProductStudentsModel.find({
                product_id,
                is_active: true,
                collaborator_id: collaborator.collaborator_id,
                payment_id,
            }),
        ]);

        if (!product) {
            throw new ApiError(httpStatus.NOT_FOUND, errorMessageConstants.products.productNotFound);
        }

        await Promise.all(
            collaboratorStudents.map(async (data: any) => {
                try {
                    const renderedEmailTemplateResponse = ejs.render(emailTemplateResponse?.htmlContent || "", {
                        name: data.name,
                        productName: product.product_title,
                        collaboratorName: collaborator?.name,
                        redirectLink: `${process.env.RFS_FRONTEND_URL}/login?collaborator_product_student_id=${data.collaborator_product_students_id}`,
                    });

                    await authService.handleSendEmail({
                        toAddresses: [data.email],
                        subject: `Product Assignment: ${product.product_title}`,
                        htmlData: renderedEmailTemplateResponse,
                        source: emailConstant.email.source.noreplyMail,
                    });

                    logger.info(`Assignment notification email sent to ${data.email}`);
                } catch (emailError) {
                    logger.error(`Failed to send email to ${data.email}:`, emailError);
                    // Don't throw error here, continue with other emails
                }
            })
        );

        return true;
    } catch (error) {
        logger.error("Error completing product assignment:", error);
        if (error instanceof ApiError) {
            throw error;
        }
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            errorMessageConstants.products.failedToCompleteProductAssignment
        );
    }
};

const checkStudentDetails = async (collaborator: any, product_id: any, csvFile: Express.Multer.File) => {
    try {
        const studentsData = await getStudentDetailsFromCSV(csvFile);
        const product = await CollaboratorProductsModel.findOne({
            product_id,
            collaborator_id: collaborator.collaborator_id,
            is_active: true,
        });

        if (!product) {
            throw new ApiError(httpStatus.NOT_FOUND, errorMessageConstants.products.productNotFound);
        }

        const collaboratorProductStudents = await CollaboratorProductStudentsModel.aggregate([
            {
                $match: {
                    product_id,
                    is_active: true,
                    $and: [
                        {
                            payment_id: {
                                $exists: true,
                                $ne: null,
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: "collaborator_payments",
                    localField: "payment_id",
                    foreignField: "payment_id",
                    as: "payment",
                    pipeline: [
                        {
                            $match: {
                                is_active: true,
                                status: { $eq: "SUCCESS" },
                            },
                        },
                    ],
                },
            },
            {
                $match: {
                    "payment.0": { $exists: true },
                },
            },
            {
                $project: {
                    email: 1,
                    _id: 0,
                },
            },
        ]);

        // Filter out any records without email before creating the Set
        const existingStudentEmails = new Set(
            collaboratorProductStudents
                .filter((student) => student && student.email)
                .map((student) => student.email.toLowerCase())
        );

        // Count how many students from CSV are already assigned
        const previouslyAssignedCount = studentsData.students.reduce(
            (count: number, student: any) =>
                student && student.email && existingStudentEmails.has(student.email.toLowerCase()) ? count + 1 : count,
            0
        );

        return {
            in_list_duplicates: studentsData.in_list_duplicates,
            previously_assigned_students: previouslyAssignedCount,
            new_students: studentsData.students.length - previouslyAssignedCount,
            total_students: studentsData.total_students,
        };
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, errorMessageConstants.products.failedToCheckStudentDetails);
    }
};

export default {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getStudentDetailsFromCSV,
    initializeAssignProductToStudent,
    completeAssignProductToStudent,
    checkStudentDetails,
};
