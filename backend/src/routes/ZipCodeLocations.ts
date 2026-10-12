import { Router, type Request, type Response } from "express";
import type { PrismaClient } from "../../prisma/generated/prisma/client.ts";

export default function createZipCodeLocationsRouter(prisma: PrismaClient) {
  const router = Router();

  router.get("/:id", async (req: Request, res: Response) => {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({ error: "Invalid ZIP code location id" });
    }

    try {
      const zipCodeLocation = await prisma.zipCodeLocation.findUnique({
        where: { id },
      });

      if (!zipCodeLocation) {
        return res.status(404).json({ error: "ZIP code location not found" });
      }

      return res.status(200).json(zipCodeLocation);
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Failed to fetch ZIP code location" });
    }
  });

  return router;
}
