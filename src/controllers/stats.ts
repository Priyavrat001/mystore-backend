import { nodeCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { calculatePercentage } from "../utils/calcultePerentage.js";
import { chartData } from "../utils/chartData.js";
import { getInventories } from "../utils/getCategory.js";


export const getDashboardStats = TryCatch(async (req, res, next) => {
    let stats = {};

    const key = "admin-stats";

    if (nodeCache.has(key)) stats = JSON.parse(nodeCache.get(key) as string);
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

        const letestTransactionPromise = Order.find({}).select(["orderItems", "discount", "total", "status"]).limit(4);


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
            femaleUsers,
            letestTransactions
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
            User.countDocuments({ gender: "female" }),
            letestTransactionPromise
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

        const orderMonthCounts = chartData({ length: 12, today, docArr: lastSixMonthOrders });

        const orderMonthlyRevenue = chartData({ length: 12, today, docArr: lastSixMonthOrders, property: "total" });

        const categoryCount = await getInventories({ categories, productsCount });


        const genderRatio = {
            male: usersCount - femaleUsers,
            female: femaleUsers
        };

        const modifiedTransactions = letestTransactions.map(i => ({
            _id: i._id,
            discount: i.discount,
            amount: i.total,
            quantity: i.orderItems.length,
            status: i.status
        }))

        stats = {
            categoryCount,
            changePercent,
            count,
            chart: {
                order: orderMonthCounts,
                revenue: orderMonthlyRevenue
            },
            genderRatio,
            letestTransactions: modifiedTransactions
        };

        nodeCache.set(key, JSON.stringify(stats));
    }


    return res.status(201).json({ success: true, stats })
});

export const getPieCharts = TryCatch(async (req, res, next) => {
    let charts;

    const key = "admin-pie-charts"

    if (nodeCache.has(key)) charts = JSON.parse(nodeCache.get(key) as string);
    else {
        const allOrderPromise = Order.find({}).select(["total", "discount", "subtotal", "tax", "shippingCharges"])

        const [
            processingOrder,
            shippedOrder,
            deliverdOrder,
            categories,
            productsCount,
            productOutOfStock,
            allOrders,
            allUsers,
            adminUser,
            coustomerUser,
        ] = await Promise.all([
            Order.countDocuments({ status: "Processing" }),
            Order.countDocuments({ status: "Shipped" }),
            Order.countDocuments({ status: "Delivered" }),
            Product.distinct("category"),
            Product.countDocuments(),
            Product.countDocuments({ sotck: 0 }),
            allOrderPromise,
            User.find({}).select(["dob"]),
            User.countDocuments({ role: "admin" }),
            User.countDocuments({ role: "user" }),
        ])

        const orderFullfillment = {
            processing: processingOrder,
            shipped: shippedOrder,
            delivered: deliverdOrder
        }

        const categoryCount = await getInventories({
            categories,
            productsCount
        });

        const staockAvailablity = {
            inStock: productsCount - productOutOfStock,
            outOfStock: productOutOfStock
        };

        const grossIncome = allOrders.reduce((prev, order) => prev + (order.total || 0), 0);

        const discount = allOrders.reduce((prev, order) => prev + (order.discount || 0), 0);

        const productionCost = allOrders.reduce((prev, order) => prev + (order.shippingCharges || 0), 0);

        const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);

        const marketingCost = Math.round(grossIncome * (30 / 100));

        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost


        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost
        };

        const userAgeGroup = {
            teen: allUsers.filter((i) => i.age < 20).length,
            adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
            old: allUsers.filter((i) => i.age >= 40).length,
        }

        const adminCoustomer = {
            admin: adminUser,
            coustomer: coustomerUser
        }

        charts = {
            orderFullfillment,
            productCategories: categoryCount,
            staockAvailablity,
            revenueDistribution,
            userAgeGroup,
            adminCoustomer
        };
        nodeCache.set(key, JSON.stringify(charts));
    }

    return res.status(201).json({ success: true, charts });
});

export const getLineCharts = TryCatch(async (req, res, next) => {


    let charts;

    const key = "admin-line-charts"

    if (nodeCache.has(key)) charts = JSON.parse(nodeCache.get(key) as string);
    else {

        const today = new Date();


        const twelveMonthsAgo = new Date(today.getMonth());
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 6);

        const baseQuery = {
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today
            }
        };

        const [
            products,
            orders,
            users

        ] = await Promise.all([
            Product.find(baseQuery).select("createdAt"),
            Order.find(baseQuery).select(["createdAt", "discount", "total"]),
            User.find(baseQuery).select("createdAt")
        ])

        const productCounts = chartData({ length: 12, today, docArr: products });

        const userCounts = chartData({ length: 12, today, docArr: users });

        const discount = chartData({ length: 12, today, docArr: orders, property: "discount" });

        const revenue = chartData({ length: 12, today, docArr: orders, property: "total" });

        charts = {
            users: userCounts,
            product: productCounts,
            discount,
            revenue

        }

        nodeCache.set(key, JSON.stringify(charts));
    }


    return res.status(201).json({ success: true, charts });

});

export const getBarCharts = TryCatch(async (req, res, next) => {

    let charts;

    const key = "admin-bar-charts"

    if (nodeCache.has(key)) charts = JSON.parse(nodeCache.get(key) as string);
    else {

        const today = new Date();

        const sixMonthsAgo = new Date(today.getMonth());
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const twelveMonthsAgo = new Date(today.getMonth());
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 6);

        const sixMonthProductsPromise = Product.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        }).select("createdAt");

        const sixMonthUsersPromise = User.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        }).select("createdAt");

        const twelveMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today
            }
        }).select("createdAt");

        const [
            products,
            orders,
            users

        ] = await Promise.all([
            sixMonthProductsPromise,
            twelveMonthOrdersPromise,
            sixMonthUsersPromise
        ])

        const productCounts = chartData({ length: 6, today, docArr: products });
        const userCounts = chartData({ length: 6, today, docArr: users });
        const orderCounts = chartData({ length: 12, today, docArr: orders });

        charts = {
            users: userCounts,
            product: productCounts,
            order: orderCounts

        }

        nodeCache.set(key, JSON.stringify(charts));
    }


    return res.status(201).json({ success: true, charts });

});
