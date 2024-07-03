import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { validatePasswordSecurity } from "../helpers/password";

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

    const recuperation = await prisma.recuperation.create({
      data: {
        email: email,
        code: recuperationCode,
      },
    });

    res.status(200).json(recuperation);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/validation", async (req, res) => {
  const { email, code, newPassword } = req.body;

  const errorValidencionMessage = "Email ou Codigo Incorreto";
  const errorPasswordMessage = "Por Favor digite a Nova Senha!!";
  const errorCodeMessage = "Codigo Inexistente";

  if (!email || !code) {
    res.status(400).json({ erro: errorValidencionMessage });
    return;
  }

  if (!newPassword) {
    res.status(400).json({ erro: errorPasswordMessage });
  }

  const passwordFormatErrors = validatePasswordSecurity(newPassword);

  if (passwordFormatErrors.length > 0) {
    res.status(400).json({ errors: passwordFormatErrors });
    return;
  }

  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(newPassword, salt);

  try {
    const validationUser = await prisma.recuperation.findFirst({
      where: { email, code },
    });

    if (validationUser == null) {
      res.status(400).json({ erro: errorCodeMessage });
      return;
    }

    const _recoveryUser = await prisma.$transaction([
      prisma.user.updateMany({
        where: { email: email },
        data: { password: { set: hash } },
      }),
      prisma.recuperation.deleteMany({ where: { code: code } }),
    ]);

    res.status(200).send("Senha Alterada Com Sucesso!!");
  } catch (error) {
    res.status(400).json(error);
  }
});
export default router;
