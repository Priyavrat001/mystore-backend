import { nodeCache } from "../app.js"
import { InvalidateCacheProps } from "../types/types.js"
import { Product } from "../models/product.js";


export const invalidateCache = async({
    product,
    order,
    admin
}: InvalidateCacheProps)=>{
    if(product){
        const productKeys: string[] = ["latest-product", "category", 'product', "all-product"]

        const products = await Product.find({}).select("_id");

        products.forEach(i => {
            productKeys.push(`product-${i._id}`)
        });

        nodeCache.del(productKeys)
    }
    if(order){

    }
    if(admin){

    }
}