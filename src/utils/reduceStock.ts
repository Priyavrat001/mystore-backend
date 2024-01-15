import { Product } from "../models/product.js";
import { OrderItemsType } from "../types/types.js";

export const reduceStock = async(orderItems:OrderItemsType[])=>{

        for (let index = 0; index < orderItems.length; index++) {
            const order = orderItems[index];
            const product = await Product.findById(order.productId);

            if(!product) throw new Error("Product not found");

            product.stock -= order.quantity;
            await product.save();
        }
}