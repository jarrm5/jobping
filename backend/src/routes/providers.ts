import { Router, type Request, type Response } from "express";
import type { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { postProvider, updateProvider } from "../services/providersService.ts";

export default function createProvidersRouter(prisma: PrismaClient) {
  const router = Router();

  router.get("/", async (req: Request, res: Response) => {
    try {
      const providers = await prisma.provider.findMany();
      return res.status(200).json(providers);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch providers" });
    }
  });

  router.get("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid provider id" });
    }

    try {
      const provider = await prisma.provider.findUnique({ where: { id } });

      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }

      return res.status(200).json(provider);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch provider" });
    }
  });

  router.post("/", async (req: Request, res: Response) => {
    try {
      const provider = await postProvider(prisma, req.body || {});

      return res.status(201).json(provider);
    } catch (err: any) {
      console.error(err);

      if (
        err?.message?.includes("Required") ||
        err?.message?.includes("Invalid") ||
        err?.message?.includes("must be")
      ) {
        return res.status(400).json({ error: err.message });
      }

      if (err?.code === "P2002") {
        return res
          .status(409)
          .json({ error: "Provider with this email already exists" });
      }

      return res
        .status(500)
        .json({ error: err?.message || "Failed to create provider" });
    }
  });

  router.put("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid provider id" });
    }

    try {
      const updatedProvider = await updateProvider(prisma, id, req.body || {});
      return res.status(200).json(updatedProvider);
    } catch (err: any) {
      console.error(err);

      if (err?.message === "Provider not found") {
        return res.status(404).json({ error: "Provider not found" });
      }

      return res
        .status(500)
        .json({ error: err?.message || "Failed to update provider" });
    }
  });

  return router;
}
