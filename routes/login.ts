import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const prisma = new PrismaClient();
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
      // await prisma.log.create({
      //   data: {
      //     descricao: "Tentativa de Acesso Inválida",
      //     complemento: `Funcionário: ${user.email}`,
      //     userId: user.id,
      //   },
      // });

      res.status(400).json({ erro: errorDefaultMessage });
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
