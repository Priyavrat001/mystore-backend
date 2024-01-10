import { User } from "../models/user.js";
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "./error.js";


// for the admin allowence middleware
export const adminOnly = TryCatch(async(req, res, next)=>{
    const {id} = req.query;

    if(!id) return next(new ErrorHandler("Invalid id please login first.", 400));

    const user = User.findById(id);

    if(!user) return next(new ErrorHandler("Invalid id", 401));

    if((await user).role !== "admin") return next(new ErrorHandler("Not allowed for the user to access this data.", 401));

    next();

});