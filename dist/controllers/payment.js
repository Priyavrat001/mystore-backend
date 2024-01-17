import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";
export const newCoupon = TryCatch(async (req, res, next) => {
    const { coupon, amount } = req.body;
    if (!coupon || !amount)
        return next(new ErrorHandler("Please enter the coupon code to access this facialty.", 404));
    await Coupon.create({
        code: coupon, amount
    });
    return res.status(201).json({
        success: true, message: "Created coupon successfully"
    });
});
export const applyDiscount = TryCatch(async (req, res, next) => {
    const { coupon } = req.query;
    const discount = await Coupon.findOne({ code: coupon });
    if (!discount)
        return next(new ErrorHandler("Invalid coupon code", 400));
    return res.status(201).json({
        success: true, discount: discount.amount
    });
});
export const allCoupon = TryCatch(async (req, res, next) => {
    const coupon = await Coupon.find({});
    if (!coupon)
        return next(new ErrorHandler("Not able to find any coupon", 400));
    return res.status(201).json({
        success: true, coupon
    });
});
export const deleteCoupon = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    await coupon.deleteOne();
    return res.status(201).json({
        success: true, message: "Coupon deleted successfully"
    });
});
