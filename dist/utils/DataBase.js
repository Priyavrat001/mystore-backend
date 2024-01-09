import mongoose from "mongoose";
const url = 'mongodb://127.0.0.1:27017/';
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
