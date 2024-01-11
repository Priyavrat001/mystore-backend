import express from 'express';
import connectToMongo from "./utils/DataBase.js";
import { errorMiddleware } from './middlewares/error.js';
// importing all routes
import userRoute from "./routes/user.js";
import productRoute from "./routes/product.js";

const port = 4000;
const app = express();
connectToMongo();

// using the middleware express.json
app.use(express.json())


// using routes
app.use("/api/v1/user", userRoute)
app.use("/api/v1/product", productRoute)

// error handling middleware
app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware)

app.listen(port, ()=>{
    console.log(`server is working on port http://localhost${port}`)
})