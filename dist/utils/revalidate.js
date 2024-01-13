import { nodeCache } from "../app.js";
import { Product } from "../models/product.js";
export const invalidateCache = async ({ product, order, admin }) => {
    if (product) {
        const productKeys = ["latest-product", "category", 'product', "all-product"];
        const products = await Product.find({}).select("_id");
        products.forEach(i => {
            productKeys.push(`product-${i._id}`);
        });
        nodeCache.del(productKeys);
    }
    if (order) {
    }
    if (admin) {
    }
};
