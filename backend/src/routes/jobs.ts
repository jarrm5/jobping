import { Router, type Request, type Response } from "express";
import type { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { postJob, updateJob } from "../services/jobService.ts";

export default function createJobsRouter(prisma: PrismaClient) {
  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    try {
      const createdJob = await postJob(prisma, req.body || {});
      return res.status(201).json(createdJob);
    } catch (err: any) {
      console.error(err);

      if (
        err?.message?.includes("CLAIMED and COMPLETED jobs require a providerId") ||
        err?.message?.includes("Invalid status") ||
        err?.message?.includes("Invalid urgency") ||
        err?.message?.includes("Job title is required") ||
        err?.message?.includes("homeownerId is required") ||
        err?.message?.includes("serviceTypeId is required")
      ) {
        return res.status(400).json({ error: err.message });
      }

      if (err?.code === "P2003" || err?.code === "P2025") {
        return res.status(400).json({ error: err.message });
      }

      return res.status(500).json({ error: "Failed to create job" });
    }
  });

  router.put("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid job id" });
    }

    try {
      const updatedJob = await updateJob(prisma, id, req.body || {});
      return res.status(200).json(updatedJob);
    } catch (err: any) {
      console.error(err);

      if (err?.message === "Job not found") {
        return res.status(404).json({ error: "Job not found" });
      }

      if (
        err?.message?.includes("OPEN jobs cannot have a providerId") ||
        err?.message?.includes("CLAIMED and COMPLETED jobs require a providerId") ||
        err?.message?.includes("Invalid status")
      ) {
        return res.status(400).json({ error: err.message });
      }

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
      zipcode: job.zip_code,
      status: job.status,
      homeownerId: job.homeowner_id,
      providerId: job.provider_id ?? null,
      createdAt: job.created_at,
      updatedAt: job.updated_at,
      address: job.address ?? null,
      city: job.city ?? null,
      latitude: job.latitude ?? null,
      longitude: job.longitude ?? null,
      serviceTypeId: job.service_type_id ?? null,
      state: job.state ?? null,
      urgency: job.urgency ?? null,
    }));

    res.status(200).json(jobs);
  });

  return router;
}
