import { Router } from "express";
import productController from "../controllers/product.controller";
import validate from "../middlewares/validate.mw";
import productsValidation from "../validations/products.validation";
import multerUtil from "../utils/multer.util";

const router = Router();

router.get("/", productController.handleGetAllProducts);
router.get("/:productId", productController.handleGetProductById);
router.post(
    "/",
    multerUtil.combinedUpload.fields([
        { name: "product_thumbnail", maxCount: 1 },
        { name: "product_brochure_or_details", maxCount: 1 },
    ]),
    productController.handleCreateProduct
);
router.put(
    "/:productId",
    multerUtil.combinedUpload.fields([
        { name: "product_thumbnail", maxCount: 1 },
        { name: "product_brochure_or_details", maxCount: 1 },
    ]),
    productController.handleUpdateProduct
);
router.delete("/:productId", validate(productsValidation.deleteProductSchema), productController.handleDeleteProduct);
router.post("/assign_product", multerUtil.csvUpload.single("document"), productController.handleAssignProductToStudent);
router.post(
    "/check_student_details/:productId",
    multerUtil.csvUpload.single("document"),
    productController.handleCheckStudentDetails
);
router.post(
    "/complete_assign_product",
    validate(productsValidation.completeProductAssignmentSchema),
    productController.handleCompleteProductAssignment
);

export default router;
