import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface TokenI {
  userLoggedId: number;
  userLoggedName: string;
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
    const { userLoggedId, userLoggedName } = decode as TokenI;

    req.userLoggedId = userLoggedId;
    req.userLoggedName = userLoggedName;

    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
}
