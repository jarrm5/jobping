import { Router, type Request, type Response } from "express";
import type { PrismaClient } from "../../prisma/generated/prisma/client.ts";

export default function createZipCodeLocationsRouter(prisma: PrismaClient) {
  const router = Router();

  router.get("/:zip", async (req: Request, res: Response) => {
    const zip = req.params.zip;

    if (typeof zip !== "string") {
      return res
        .status(400)
        .json({ error: "Invalid zip for ZIP Code location" });
    }

    try {
      const zipCodeLocation = await prisma.zipCodeLocation.findUnique({
        where: { zipCode: zip },
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
