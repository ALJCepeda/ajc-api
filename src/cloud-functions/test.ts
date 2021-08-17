import {Request, Response} from "express";

export function test(req:Request, res:Response) {
  const message = req.query.message || req.body.message || 'Hello World!';
  res.status(200).send(message)
};