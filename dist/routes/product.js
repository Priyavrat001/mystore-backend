import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { createProduct, deleteProduct, getAdminProducts, getAllCategory, getlatestProducts, getSingleProduct, searchAllProduct, updateProduct } from "../controllers/product.js";
import { singleUpload } from "../middlewares/multer.js";
const app = express.Router();
// Create new products---> api/v1/product/new
app.post("/new", adminOnly, singleUpload, createProduct);
// Get letest products---> api/v1/product/letest
app.get("/letest", getlatestProducts);
// Search all products---> api/v1/product/all
app.get("/all", searchAllProduct);
// Get products category---> api/v1/product/category
app.get("/category", getAllCategory);
// Get admin products---> api/v1/product/admin-product
app.get("/admin-product", getAdminProducts);
// Delete upadate (admin only) and get route by id---> api/v1/product/:id
app.route("/:id").get(getSingleProduct).put(adminOnly, singleUpload, updateProduct).delete(adminOnly, deleteProduct);
export default app;
