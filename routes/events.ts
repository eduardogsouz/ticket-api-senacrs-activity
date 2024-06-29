import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { verificaToken } from "../middewares/verificaToken";

const prisma = new PrismaClient();

async function main() {
  /***********************************/
  /* SOFT DELETE MIDDLEWARE */
  /***********************************/
  prisma.$use(async (params, next) => {
    // Check incoming query type
    if (params.model == "Animal") {
      if (params.action == "delete") {
        // Delete queries
        // Change action to an update
        params.action = "update";
        params.args["data"] = { deleted: true };
      }
    }
    return next(params);
  });
}
main();

const router = Router();

router.get("/", async (req, res) => {
  try {
    const animais = await prisma.animal.findMany({
      where: { deleted: false },
    });
    res.status(200).json(animais);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/", verificaToken, async (req: any, res) => {
  // dados que são fornecidos no corpo da requisição
  const { nome, raca, idade, custo_mensal } = req.body;

  // dado que é acrescentado pelo Token (verificaToken) no req
  const { userLogadoId } = req;

  if (!nome || !raca || !idade || !custo_mensal) {
    res.status(400).json({ erro: "Informe nome, raca, idade e custo_mensal" });
    return;
  }

  try {
    const animal = await prisma.animal.create({
      data: { nome, raca, idade, custo_mensal, usuarioId: userLogadoId },
    });
    res.status(201).json(animal);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete("/:id", verificaToken, async (req: any, res) => {
  const { id } = req.params;

  try {
    const animal = await prisma.animal.delete({
      where: { id: Number(id) },
    });

    await prisma.log.create({
      data: {
        descricao: "Exclusão De Animal no Zoo",
        complemento: `Funcionário: ${req.userLogadoNome}`,
        usuarioId: req.userLogadoId,
      },
    });
    res.status(200).json(animal);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.put("/:id", verificaToken, async (req, res) => {
  const { id } = req.params;
  const { nome, raca, idade, custo_mensal } = req.body;

  if (!nome || !raca || !idade || !custo_mensal) {
    res.status(400).json({ erro: "Informe nome, raca, idade e custo_mensal" });
    return;
  }

  try {
    const animal = await prisma.animal.update({
      where: { id: Number(id) },
      data: { nome, raca, idade, custo_mensal },
    });
    res.status(200).json(animal);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
