import mongoose from "mongoose";
import validator from "validator";

interface IUser extends Document {
    _id: string;
    name: string;
    photo: string;
    eamil: string;
    role: "admin" | "user";
    gender: "male" | "female";
    dob: Date,
    createdAt: Date;
    updatedAt: Date;
    //virtual atrribute
    age: number;

}

const schema = new mongoose.Schema({
    _id: {
        type: String,
        require: [true, "Please Enter ID"]
    },
    name: {
        type: String,
        require: [true, "Please Enter Name"]
    },
    email: {
        type: String,
        unique: [true, "Email Already Exist"],
        require: [true, "Please Enter email"],
        validator: validator.default.isEmail
    },
    photo: {
        type: String,
        require: [true, "Please Enter Photo"]
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    gender: {
        type: String,
        enum: ["male", "female"],
        require: [true, "Please Enter Gender"]
    },
    dob: {
        type: Date,
        require: [true, "Please Enter Date Of Birth"]
    },

},
    {
        timestamps: true,
    }
);

schema.virtual("age").get(function () {
    const today = new Date();
    const dob:any = this.dob;
    let age = today.getFullYear() - dob!.getFullYear();

    if (today.getMonth() < dob!.getMonth() || today.getMonth() === dob!.getMonth() && today.getDate() < dob.getDate()) {
        age--;
    }
    return age
})

export const User = mongoose.model<IUser>("User", schema)