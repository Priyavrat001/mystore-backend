import { nodeCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { calculatePercentage } from "../utils/calcultePerentage.js";


export const getDashboardStats = TryCatch(async (req, res, next) => {
    let stats = {};

    if (nodeCache.has("admin-stats")) stats = JSON.parse(nodeCache.get("admin-stats") as string);
    else {
        const today = new Date();

        const sixMonthAgo = new Date(today.getMonth());
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);

        const thisMonth = {
            start: new Date(today.getFullYear(), today.getMonth(), 1),
            end: today
        };

        const lastMonth = {
            start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
            end: new Date(today.getFullYear(), today.getMonth(), 0)
        };


        const thisMonthProductsPromise = Product.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });

        const lastMonthProductsPromise = Product.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });


        const thisMonthUsersPromise = User.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });

        const lastMonthUsersPromise = User.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });

        const thisMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end
            }
        });

        const lastMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end
            }
        });

        const lastSixMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
        });

        const [
            thisMonthProducts,
            lastMonthProducts,
            thisMonthUsers,
            lastMonthUsers,
            thisMonthOrders,
            lastMonthOrders,
            productsCount,
            usersCount,
            allOrders,
            lastSixMonthOrders,
            categories,
            femaleUsers
        ] = await Promise.all([
            thisMonthProductsPromise,
            lastMonthProductsPromise,
            thisMonthUsersPromise,
            lastMonthUsersPromise,
            thisMonthOrdersPromise,
            lastMonthOrdersPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find({}).select("total"),
            lastSixMonthOrdersPromise,
            Product.distinct("category"),
            User.countDocuments({gender:"female"})
        ]);

        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.total || 0), 0);

        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order.total || 0), 0);

        const changePercent = {
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),

            product: calculatePercentage(thisMonthProducts.length, lastMonthProducts.length),

            user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),

            order: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length)

        }

        const revenue = allOrders.reduce((total, order) => total + (order.total || 0), 0);

        const count = {
            revenue: revenue,
            user: usersCount,
            product: productsCount,
            order: allOrders.length,
        }

        const orderMonthCounts = new Array(6).fill(0);
        const orderMonthlyRevenue = new Array(6).fill(0);

        lastSixMonthOrders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthDiff = today.getMonth() - creationDate.getMonth();

            if (monthDiff < 6) {
                orderMonthCounts[6 - monthDiff - 1] += 1;
                orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
            }
        });

        const categoriesCountPromise = categories.map((category) => Product.countDocuments({ category }));

        const categoriesCount = await Promise.all(categoriesCountPromise);

        const categoryCount: Record<string, number>[] = [];

        categories.forEach((category, i) => {
            categoryCount.push({
                [category]: Math.round(categoriesCount[i] / productsCount * 100)
            })
        });

        const genderRatio = {
            male: usersCount - femaleUsers,
            female: femaleUsers
        };

        stats = {
            categoryCount,
            changePercent,
            count,
            chart: {
                order: orderMonthCounts,
                revenue: orderMonthlyRevenue
            },
            genderRatio
        };
    }


    return res.status(201).json({ success: true, stats })
});

export const getPieCharts = TryCatch(async (req, res, next) => {

});

export const getLineCharts = TryCatch(async (req, res, next) => {

});

export const getBarCharts = TryCatch(async (req, res, next) => {

});
