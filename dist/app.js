import express from 'express';
import connectToMongo from "./utils/DataBase.js";
import { errorMiddleware } from './middlewares/error.js';
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from 'morgan';
import Stripe from 'stripe';
// importing all routes
import userRoute from "./routes/user.js";
import productRoute from "./routes/product.js";
import orderRoute from "./routes/order.js";
import paymentRoute from "./routes/payment.js";
import statsRoute from "./routes/stats.js";
config();
const port = process.env.PORT;
const app = express();
connectToMongo();
const stripeKey = process.env.STRIPE_KEY;
export const nodeCache = new NodeCache();
export const stripe = new Stripe(stripeKey);
// using the middleware express.json
app.use(express.json());
app.use(morgan("dev"));
// using routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", statsRoute);
// error handling middleware
app.use("/uploads", express.static("uploads"));
app.use(errorMiddleware);
app.listen(port, () => {
    console.log(`server is working on port http://localhost${port}`);
});
