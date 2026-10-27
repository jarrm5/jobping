import { Router, type Request, type Response } from "express";
import type { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { postJob, updateJob } from "../services/jobService.ts";

export default function createJobsRouter(prisma: PrismaClient) {
  const router = Router();

  router.get("/", async (req: Request, res: Response) => {
    try {
      const jobs = await prisma.job.findMany();
      return res.status(200).json(jobs);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  router.get("/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid job id" });
    }

    try {
      const job = await prisma.job.findUnique({ where: { id } });

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      return res.status(200).json(job);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  router.post("/", async (req: Request, res: Response) => {
    try {
      const createdJob = await postJob(prisma, req.body || {});
      return res.status(201).json(createdJob);
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.message;
      if (
        errorMessage?.includes(
          "CLAIMED and COMPLETED jobs require a providerId",
        ) ||
        errorMessage?.includes("Invalid status") ||
        errorMessage?.includes("Invalid urgency") ||
        errorMessage?.includes("Job title is required") ||
        errorMessage?.includes("homeownerId is required") ||
        errorMessage?.includes("serviceTypeId is required")
      ) {
        return res.status(400).json({ error: err.message });
      }

      if (err?.code === "P2003" || err?.code === "P2025") {
        return res.status(400).json({ error: err.message });
      }

      return res
        .status(500)
        .json({ error: errorMessage || "Failed to create job" });
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
        err?.message?.includes(
          "CLAIMED and COMPLETED jobs require a providerId",
        ) ||
        err?.message?.includes("Invalid status")
      ) {
        return res.status(400).json({ error: err.message });
      }

      if (err?.code === "P2025") {
        return res.status(404).json({ error: "Job not found" });
      }

      return res
        .status(500)
        .json({ error: err?.message || "Failed to update job" });
    }
  });

  return router;
}
