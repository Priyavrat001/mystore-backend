import { User } from "../models/user.js";
export const newUser = async (req, res, next) => {
    try {
        const { name, email, gender, photo, _id, dob } = req.body;
        const user = await User.create({
            name, email, gender, photo, _id, dob: new Date(dob)
        });
        return res.status(200).json({ message: `Welcome ${user.name}`, success: true, user });
    }
    catch (error) {
        next(error);
    }
};
