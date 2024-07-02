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
    if (params.model == "Ticket") {
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

router.get("/", async (_req, res) => {
  try {
    const ticket = await prisma.ticket.findMany({
      where: { deleted: false },
    });
    res.status(200).json(ticket);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/", verificaToken, async (req: any, res) => {
  // dados que são fornecidos no corpo da requisição
  const { description, eventName, price, type } = req.body;

  // dado que é acrescentado pelo Token (verificaToken) no req
  const { userLogadoId } = req;

  if (!eventName || !description || !price || !type) {
    res
      .status(400)
      .json({ erro: "Informe: Nome do Evento, descrição, preço e tipo" });
    return;
  }

  try {
    const ticket = await prisma.ticket.create({
      data: {
        description,
        eventName,
        price,
        type,
        userId: userLogadoId,
      },
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete("/:id", verificaToken, async (req: any, res) => {
  const { id } = req.params;

  try {
    const ticket = await prisma.ticket.delete({
      where: { id: Number(id) },
    });

    // await prisma.log.create({
    //   data: {
    //     descricao: "Exclusão De Animal no Zoo",
    //     complemento: `Funcionário: ${req.userLogadoNome}`,
    //     usuarioId: req.userLogadoId,
    //   },
    // });
    res.status(200).json(ticket);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.put("/:id", verificaToken, async (req, res) => {
  const { id } = req.params;
  const { description, eventName, price, type } = req.body;

  if (!eventName || !description || !price || !type) {
    res
      .status(400)
      .json({ erro: "Informe: Nome do Evento, descrição, preço e tipo" });
    return;
  }

  try {
    const ticket = await prisma.ticket.update({
      where: { id: Number(id) },
      data: {
        description,
        eventName,
        price,
        type,
      },
    });
    res.status(200).json(ticket);
  } catch (error) {
    res.status(400).json(error);
  }
});

export default router;
