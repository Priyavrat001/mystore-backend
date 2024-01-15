import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { allOrders, createOrder, deleteOrder, getSingleOrder, myOrder, processOrder } from "../controllers/order.js";

const app = express.Router();

//Route: api/v1/order/new
app.post("/new", createOrder);

//Route: api/v1/order/my
app.get("/my", myOrder);

//Route: api/v1/order/all
app.get("/all",adminOnly, allOrders);

//Route: api/v1/order/all
app.route("/:id").get(getSingleOrder).put(adminOnly, processOrder).delete(adminOnly, deleteOrder)



export default app
