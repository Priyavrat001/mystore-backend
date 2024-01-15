import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const url = process.env.MONGO_URL;
const connectToMongo = () => {
    try {
        mongoose.connect(url, {
            dbName: "mystore"
        });
        console.log("connected to mongodb");
    }
    catch (error) {
        console.log(error);
    }
};
export default connectToMongo;
