import { Router, type Request, type Response } from "express";
import type { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { JobStatus } from "../../prisma/generated/prisma/enums.ts";

export default function createJobsRouter(prisma: PrismaClient) {
  const router = Router();

  router.put("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid job id" });
    }

    const body = req.body || {};
    const updateData: any = {};
    const allowedStatuses = Object.values(JobStatus);

    if ("title" in body) updateData.title = body.title;
    if ("description" in body) updateData.description = body.description;
    if ("category" in body) updateData.category = body.category;
    if ("zipcode" in body) updateData.zip_code = body.zipcode;
    if ("zipCode" in body) updateData.zip_code = body.zipCode;
    if ("status" in body) {
      if (!allowedStatuses.includes(body.status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      updateData.status = body.status;
    }
    if ("homeowner_id" in body) {
      const val = Number(body.homeowner_id);
      if (!Number.isInteger(val)) {
        return res.status(400).json({ error: "Invalid homeowner_id" });
      }
      updateData.homeowner_id = val;
    }
    if ("provider_id" in body) {
      const val = body.provider_id === null ? null : Number(body.provider_id);
      if (body.provider_id !== null && !Number.isInteger(val)) {
        return res.status(400).json({ error: "Invalid provider_id" });
      }
      updateData.provider_id = val;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    updateData.updated_at = new Date();

    try {
      const updatedJob = await prisma.job.update({
        where: { id },
        data: updateData,
      });
      return res.status(200).json(updatedJob);
    } catch (err: any) {
      console.error(err);
      if (err?.code === "P2025") {
        return res.status(404).json({ error: "Job not found" });
      }
      return res.status(500).json({ error: "Failed to update job" });
    }
  });

  router.get("/", async (req: Request, res: Response) => {
    const allJobs = await prisma.job.findMany();

    const jobs = allJobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      category: job.category,
      zipcode: job.zip_code,
      status: job.status,
      homeowner_id: job.homeowner_id,
      provider_id: job.provider_id ?? null,
      created_at: job.created_at,
      updated_at: job.updated_at,
    }));

    res.status(200).json(jobs);
  });

  return router;
}
