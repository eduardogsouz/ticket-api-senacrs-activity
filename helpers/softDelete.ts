import { PrismaClient } from "@prisma/client";

export async function main(prisma: PrismaClient) {
  prisma.$use(async (params, next) => {
    if (params.model == "Ticket") {
      if (params.action == "delete") {
        params.action = "update";
        params.args["data"] = { deleted: true };
      }
    }
    return next(params);
  });
}
