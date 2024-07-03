import bcrypt from "bcrypt";
import { Router } from "express";

import { PrismaClient } from "@prisma/client";

import { validatePasswordSecurity } from "../helpers/password";
import { checkToken } from "../middewares/checkToken";

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (_req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/", checkToken, async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ erro: "Informe nome, email e senha" });
    return;
  }

  const passwordFormatErrors = validatePasswordSecurity(password);

  if (passwordFormatErrors.length > 0) {
    res.status(400).json({ errors: passwordFormatErrors });
    return;
  }

  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(password, salt);

  try {
    const checkEmailAvailability = async (email: string) => {
      return !(await prisma.user.findFirst({
        where: {
          email,
        },
      }));
    };

    const isChosenEmailAvailable = await checkEmailAvailability(email);

    if (!isChosenEmailAvailable) {
      return res
        .status(409)
        .json({ message: "Esse email não está disponível" });
    }

    const user = await prisma.user.create({
      data: { name, email, password: hash },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
