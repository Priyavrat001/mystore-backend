import { nodeCache } from "../app.js";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";
export const invalidateCache = async ({ product, order, admin, userId, orderId, productId }) => {
    if (product) {
        const productKeys = ["latest-product", "category", 'product', "all-product", `product-${productId}`];
        const products = await Product.find({}).select("_id");
        nodeCache.del(productKeys);
    }
    if (order) {
        const ordersKeys = [`all-orders`, `my-orders-${userId}`, `single-order-${orderId}`];
        const orders = await Order.find({}).select("_id");
        nodeCache.del(ordersKeys);
    }
    if (admin) {
    }
};
