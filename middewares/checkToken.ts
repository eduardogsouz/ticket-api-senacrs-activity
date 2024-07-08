import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface TokenI {
  loggedUserId: number;
  loggedUserName: string;
}

export function checkToken(
  req: Request | any,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401).json({ error: "Token não informado" });
    return;
  }

  const token = authorization.split(" ")[1];

  try {
    const decode = jwt.verify(token, process.env.JWT_KEY as string);
    console.log(decode);
    const { loggedUserId, loggedUserName } = decode as TokenI;

    req.loggedUserId = loggedUserId;
    req.loggedUserName = loggedUserName;

    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
}
