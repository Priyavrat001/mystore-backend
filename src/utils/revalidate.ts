import { nodeCache } from "../app.js"
import { InvalidateCacheProps } from "../types/types.js"
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";


export const invalidateCache = async({
    product,
    order,
    admin,
    userId,
    orderId,
    productId
}: InvalidateCacheProps)=>{
    if(product){
        const productKeys: string[] = ["latest-products", "category", 'product', "all-product"]

        const products = await Product.find({}).select("_id");
        
        if(typeof productId === "string") productKeys.push(`product-${productId}`)

        if(typeof productId === "object") productId.forEach((i)=>{
            productKeys.push(`product-${i}`)
        })
        
        nodeCache.del(productKeys)
    }
    if(order){
        const ordersKeys: string[] = [`all-orders`, `my-orders-${userId}`, `single-order-${orderId}`] ;
        const orders = await Order.find({}).select("_id");

        nodeCache.del(ordersKeys)

    }
    if(admin){
        nodeCache.del(["admin-stats", "admin-pie-charts", "admin-bar-charts", "admin-line-charts"])
    }
}