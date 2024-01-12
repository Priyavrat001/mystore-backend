import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import dotenv from "dotenv";
dotenv.config()

export const createProduct = TryCatch(async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {

  const { name, stock, category, price } = req.body;
  const photo = req.file;

  if (!photo) return next(new ErrorHandler("Please upload image", 400));

  if (!name || !price || !stock || !category) {

    rm(photo.path, () => {
      console.log("deleted")
    });

    return next(new ErrorHandler("Invalid product data.", 400));
  }

  const product = await Product.create({
    name, photo: photo?.path, stock, price, category: category.toLowerCase()
  });

  return res.status(200).json({ success: true, message: "Product created successfully." });
});


export const getLetestProducts = TryCatch(async (req, res, next) => {

  const product = await Product.find({}).sort({ createdAt: -1 }).limit(5);

  return res.status(200).json({ success: true, product });
});


export const getAllCategory = TryCatch(async (req, res, next) => {

  const category = await Product.distinct("category");

  return res.status(200).json({ success: true, category });
});

export const getAdminProducts = TryCatch(async (req, res, next) => {

  const product = await Product.find({});

  return res.status(200).json({ success: true, product });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {

  const id = req.params.id

  const product = await Product.findById(id);
  if (!product) return next(new ErrorHandler("Product not found.", 404))

  return res.status(200).json({ success: true, product });
});


export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category } = req.body;
  const photo = req.file;
  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  if (photo) {
    rm(product.photo!, () => {
      console.log("Old Photo Deleted");
    });
    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();

  return res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
});

export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  rm(product.photo!, () => {
    console.log("Product Photo Deleted");
  });

  await product.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const searchAllProduct = TryCatch(async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {

  const { search, sort, category, price } = req.query;

  const page = Number(req.query.page) || 1;

  const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;

  const skip = (page - 1) * limit;

  const baseQuery : BaseQuery = {
 
  }
  if(search){
    baseQuery.name = {
      $regex: search,
      $options: "i"
    }
  }
  if(price){
    baseQuery.price={
      $lte: Number(price),
    }
  }

  if(category) baseQuery.category= category;

  const productPromise = Product.find(baseQuery).sort(sort && {price: sort==="asc"? 1: -1}).limit(limit).skip(skip);

  const [product, filterProduct] = await Promise.all([
    productPromise,
    Product.find(baseQuery)
  ]);

  const totalPage = Math.ceil(filterProduct.length / limit);

  return res.status(200).json({ success: true, product, totalPage });
});