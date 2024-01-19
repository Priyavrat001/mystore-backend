import express from "express"
import { adminOnly } from "../middlewares/auth.js";
import { allCoupon, applyDiscount, createPaymentIntent, deleteCoupon, newCoupon } from "../controllers/payment.js";

const app = express.Router();

//Route: api/v1/payment/create
app.post("/create", createPaymentIntent);

//Route: api/v1/payment/discount
app.get("/discount", applyDiscount);

//Route: api/v1/payment/coupon/new
app.post("/coupon/new", adminOnly, newCoupon);

//Route: api/v1/payment/coupon/all---.admin
app.get("/coupon/all", adminOnly, allCoupon);

//Route: api/v1/payment/coupon/:id---.admin
app.delete("/coupon/:id", adminOnly, deleteCoupon);



export default app
