import { Response } from "express";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";
import productService from "../services/product.service";
import { responseConstants } from "../constants";
import logger from "../config/logger";
import ApiError from "../utils/api-error";
import analyticsService from "../services/analytics.service";

const handleGetAllProducts = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    const products = await productService.getAllProducts(collaborator?.collaborator_id);
    res.status(httpStatus.OK).json({
        success: true,
        message: responseConstants.products.getAllProducts,
        data: products,
    });
});

const handleGetProductById = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    const productId = req.params.productId;
    const product = await productService.getProductById(collaborator?.collaborator_id, productId);
    const stats = await analyticsService.getAnalyticsByProduct(collaborator?.collaborator_id, productId);
    res.status(httpStatus.OK).json({
        success: true,
        message: responseConstants.products.getProductById,
        data: {
            product,
            stats,
        },
    });
});

const handleCreateProduct = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    logger.info("Request body:", req.body);
    logger.info("Files:", req.files);
    const product = await productService.createProduct(collaborator?.collaborator_id, {
        ...req.body,
        product_thumbnail: req.files["product_thumbnail"]?.[0]?.location,
        product_brochure_or_details: req.files["product_brochure_or_details"]?.[0]?.location || null,
        trigger_assessment: req.body.trigger_assessment === "true",
        product_price: Number(req.body.product_price),
        product_duration: req.body.product_duration,
        product_type: req.body.product_type, // Ensure it's uppercase for enum validation
    });
    res.status(httpStatus.OK).json({
        success: true,
        message: responseConstants.products.createProduct,
        data: product,
    });
});

const handleUpdateProduct = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    const productId = req.params.productId;

    // Prepare update data
    const updateData = { ...req.body };

    // Handle file uploads if they exist
    if (req.files) {
        if (req.files["product_thumbnail"]) {
            updateData.product_thumbnail = req.files["product_thumbnail"][0].location;
        }
        if (req.files["product_brochure_or_details"]) {
            updateData.product_brochure_or_details = req.files["product_brochure_or_details"][0].location;
        }
    }

    const product = await productService.updateProduct(collaborator?.collaborator_id, productId, updateData);
    res.status(httpStatus.OK).json({
        success: true,
        message: responseConstants.products.updateProduct,
        data: product,
    });
});

const handleDeleteProduct = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    const productId = req.params.productId;
    const product = await productService.deleteProduct(collaborator?.collaborator_id, productId);
    res.status(httpStatus.OK).json({
        success: true,
        message: responseConstants.products.deleteProduct,
        data: product,
    });
});

const handleAssignProductToStudent = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    const { product_id } = req.body;
    console.log("req.file", req.file);

    if (!req.file) {
        throw new ApiError(httpStatus.BAD_REQUEST, "CSV file is required");
    }

    if (req.file.mimetype !== "text/csv") {
        throw new ApiError(httpStatus.BAD_REQUEST, "Only CSV files are allowed");
    }

    if (!req.body.collaborator_student_tags) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Student tags are required");
    }

    if (req.body.collaborator_student_tags) {
        const tags = req.body.collaborator_student_tags.split(",");
        req.body.collaborator_student_tags = tags.map((tag: string) => tag.trim());
    }

    const csvFile = req.file;
    logger.info("Processing CSV upload:", {
        filename: csvFile.originalname,
        size: csvFile.size,
        mimetype: csvFile.mimetype,
    });

    const studentsData = await productService.getStudentDetailsFromCSV(csvFile);
    const payment = await productService.initializeAssignProductToStudent(
        collaborator,
        studentsData?.students,
        product_id,
        req.body.collaborator_student_tags
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: responseConstants.products.assignProductToStudent,
        data: payment,
    });
});

const handleCompleteProductAssignment = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    const { payment_id, razorpay_details, product_id } = req.body;
    await productService.completeAssignProductToStudent(collaborator, payment_id, razorpay_details, product_id);
    res.status(httpStatus.OK).json({
        success: true,
        message: responseConstants.products.completeProductAssignment,
    });
});

const handleCheckStudentDetails = catchAsync(async (req: any, res: Response) => {
    const collaborator = req.collaborator;
    const product_id = req.params.productId;

    if (!req.file) {
        throw new ApiError(httpStatus.BAD_REQUEST, "CSV file is required");
    }

    if (req.file.mimetype !== "text/csv") {
        throw new ApiError(httpStatus.BAD_REQUEST, "Only CSV files are allowed");
    }

    const csvFile = req.file;
    logger.info("Processing CSV upload:", {
        filename: csvFile.originalname,
        size: csvFile.size,
        mimetype: csvFile.mimetype,
    });

    const csvData = await productService.checkStudentDetails(collaborator, product_id, csvFile);
    res.status(httpStatus.OK).json({
        success: true,
        message: responseConstants.products.checkStudentDetails,
        data: csvData,
    });
});

export default {
    handleGetAllProducts,
    handleGetProductById,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleAssignProductToStudent,
    handleCompleteProductAssignment,
    handleCheckStudentDetails,
};
