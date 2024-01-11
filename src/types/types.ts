import { NextFunction, Request, Response } from "express";


export interface NewUserRequestBody{
    name:string;
    email:string;
    gender:string;
    photo:string;
    _id:string;
    dob:Date;
}

export interface NewProductRequestBody{
    name:string;
    price:number;
    stock:number;
    category:string;
}


export type ControllerType = (
    req: Request<any>,
    res: Response,
    next: NextFunction
  ) => Promise<void | Response<any, Record<string, any>>>;

