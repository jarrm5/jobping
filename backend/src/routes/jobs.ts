import { Router, type Request, type Response } from "express";
import type { PrismaClient } from "../../prisma/generated/prisma/client.ts";
import { JobStatus, JobUrgency } from "../../prisma/generated/prisma/enums.ts";

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
    const allowedUrgencies = Object.values(JobUrgency);

    if ("title" in body) updateData.title = body.title;
    if ("description" in body) updateData.description = body.description;
    if ("zipcode" in body) updateData.zip_code = body.zipcode;
    if ("zipCode" in body) updateData.zip_code = body.zipCode;
    if ("address" in body) updateData.address = body.address;
    if ("city" in body) updateData.city = body.city;
    if ("state" in body) updateData.state = body.state;
    if ("serviceTypeId" in body)
      updateData.service_type_id = Number(body.serviceTypeId);
    if ("service_type_id" in body)
      updateData.service_type_id = Number(body.service_type_id);
    if ("latitude" in body) updateData.latitude = Number(body.latitude);
    if ("longitude" in body) updateData.longitude = Number(body.longitude);
    if ("status" in body) {
      if (!allowedStatuses.includes(body.status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      updateData.status = body.status;
    }
    if ("urgency" in body) {
      if (!allowedUrgencies.includes(body.urgency)) {
        return res.status(400).json({ error: "Invalid urgency" });
      }
      updateData.urgency = body.urgency;
    }
    if ("homeowner_id" in body || "homeownerId" in body) {
      const val = Number(body.homeowner_id ?? body.homeownerId);
      if (!Number.isInteger(val)) {
        return res.status(400).json({ error: "Invalid homeowner_id" });
      }
      updateData.homeowner_id = val;
    }
    if ("provider_id" in body || "providerId" in body) {
      const raw = body.provider_id ?? body.providerId;
      const val = raw === null ? null : Number(raw);
      if (raw !== null && !Number.isInteger(val)) {
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
