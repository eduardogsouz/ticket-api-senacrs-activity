import { PrismaClient } from "@prisma/client";
import { Router } from "express";

import { checkToken } from "../middewares/checkToken";
import { main } from "../helpers/softDelete";

const prisma = new PrismaClient();

main(prisma);

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

router.post("/", checkToken, async (req: any, res) => {
  const { description, eventName, price, type } = req.body;

  const { loggedUserId } = req;

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
        userId: loggedUserId,
      },
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete("/:id", checkToken, async (req: any, res) => {
  const { id } = req.params;

  try {
    const ticket = await prisma.ticket.delete({
      where: { id: Number(id) },
    });

    await prisma.log.create({
      data: {
        description: "Exclusão De Ticket",
        complement: `Usuário: ${req.loggedUserName}`,
        userId: req.loggedUserId,
      },
    });
    res.status(200).json(ticket);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.put("/:id", checkToken, async (req, res) => {
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
