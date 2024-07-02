import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { PrismaClient } from "@prisma/client";
import { Router } from "express";

// const prisma = new PrismaClient();
const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "stdout",
      level: "error",
    },
    {
      emit: "stdout",
      level: "info",
    },
    {
      emit: "stdout",
      level: "warn",
    },
  ],
});

prisma.$on("query", (e) => {
  console.log("Query: " + e.query);
  console.log("Params: " + e.params);
  console.log("Duration: " + e.duration + "ms");
});
const router = Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  const errorDefaultMessage = "Login ou senha incorretos";

  if (!email || !password) {
    res.status(400).json({ erro: errorDefaultMessage });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (user == null) {
      res.status(400).json({ erro: errorDefaultMessage });
      return;
    }

    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(
        {
          userLogadoId: user.id,
          userLogadoNome: user.name,
        },
        process.env.JWT_KEY as string,
        { expiresIn: "1h" }
      );

      res.status(200).json({
        id: user.id,
        nome: user.name,
        email: user.email,
        token,
      });
    } else {
      await prisma.log.create({
        data: {
          description: "Tentativa de Acesso Inválida",
          complement: `Usuário: ${user.email}`,
          userId: user.id,
        },
      });

      res.status(400).json({ erro: errorDefaultMessage });
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/recovery", async (req, res) => {
  const { email } = req.body;

  const errorRecoverMessage = "Email Incorreto ou Inexistente";

  if (!email) {
    res.status(400).json({ erro: errorRecoverMessage });
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { email },
    });
    if (user == null) {
      res.status(400).json({ erro: errorRecoverMessage });
      return;
    }
    let recuperationCode = Math.floor(1000 + Math.random() * 9000);

    res.status(200).json({
      email: user.email,
      code: recuperationCode,
    });
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
