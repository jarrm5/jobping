import "dotenv/config";
import express, { type Request, type Response } from "express";
import sampleJobs from "../sample_json_data/jobs.json" with { type: "json" };
import { PrismaClient } from "./prisma/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;
const app = express();
const jobsSampleData = Array.isArray(sampleJobs?.jobs) ? sampleJobs.jobs : [];

if (!databaseUrl) {
  throw new Error(
    "Missing DATABASE_URL. Add it to your .env file, e.g. DATABASE_URL=postgresql://user:password@localhost:5432/jobping?schema=public",
  );
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});
const prisma = new PrismaClient({
  adapter,
});

//cors
app.use((req: Request, res: Response, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to the JobPinggggg API!!!" });
});

//route for updating job
app.put("/jobs/:id", async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid job id" });
  }

  const body = req.body || {};
  const updateData: any = {};

  if ("title" in body) updateData.title = body.title;
  if ("description" in body) updateData.description = body.description;
  if ("category" in body) updateData.category = body.category;
  if ("zipcode" in body) updateData.zip_code = body.zipcode;
  if ("status" in body) {
    const allowed = ["open", "claimed"];
    if (!allowed.includes(body.status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    updateData.status = body.status;
  }
  if ("provider_id" in body) {
    const val = body.provider_id === null ? null : Number(body.provider_id);
    if (body.provider_id !== null && !Number.isInteger(val)) {
      return res.status(400).json({ error: "Invalid providerId" });
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

//route for fetching job by provider id

//route for fetching job by homeowner id

app.get("/jobs", async (req: Request, res: Response) => {
  const allJobs = await prisma.job.findMany();

  const jobs = allJobs.map((job) => ({
    id: job.id,
    title: job.title,
    description: job.description,
    category: job.category,
    zipcode: job.zip_code,
    status: job.status,
    homeownerId: job.homeowner_id,
    providerId: job.provider_id ?? null,
    created_at: job.created_at,
    updated_at: job.updated_at,
  }));

  res.status(200).json(jobs);
});
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
