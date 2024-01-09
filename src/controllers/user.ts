import { NextFunction, Response, Request} from "express";
import { User } from "../models/user.js"
import { NewUserRequestBody } from "../types/types.js"


export const newUser = async (req: Request<{}, {}, NewUserRequestBody>
    , res: Response,
    next: NextFunction
) => {

    try {
        const { name, email, gender, photo, _id, dob } = req.body;

        const user = await User.create({
            name, email, gender, photo, _id, dob:new Date(dob)
        });

        return res.status(200).json({ message: `Welcome ${user.name}`, success: true, user })

    } catch (error) {
       next(error)
    }

}