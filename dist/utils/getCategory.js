import { Product } from "../models/product.js";
export const getInventories = async ({ categories, productsCount }) => {
    const categoriesCountPromise = categories.map((category) => Product.countDocuments({ category }));
    const categoriesCount = await Promise.all(categoriesCountPromise);
    const categoryCount = [];
    categories.forEach((category, i) => {
        categoryCount.push({
            [category]: Math.round(categoriesCount[i] / productsCount * 100)
        });
    });
    return categoryCount;
};
