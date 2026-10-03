//const express = require("express");
import "dotenv/config";
import express, { type Request, type Response } from "express";
import sampleJobs from "../sample_json_data/jobs.json" with { type: "json" };
//import { PrismaClient } from "./prisma/generated/prisma/client.ts";
//import { PrismaPg } from "@prisma/adapter-pg";

//const databaseUrl = process.env.DATABASE_URL;
const app = express();
const jobs = Array.isArray(sampleJobs?.jobs) ? sampleJobs.jobs : [];

// if (!databaseUrl) {
//   throw new Error(
//     "Missing DATABASE_URL. Add it to your .env file, e.g. DATABASE_URL=postgresql://user:password@localhost:5432/jobping?schema=public",
//   );
// }

// const adapter = new PrismaPg({
//   connectionString: databaseUrl,
// });
// const prisma = new PrismaClient({
//   adapter,
// });

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
// Get all jobs

app.get("/", async (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to the JobPinggggg API!!!" });
});

app.get("/jobs", async (req: Request, res: Response) => {
  res.status(200).json(jobs);
});

//route for updating job

//route for fetching job by provider id

//route for fetching job by homeowner id

// app.get("/jobs", async (req: Request, res: Response) => {
//   const allJobs = await prisma.job.findMany();

//   const jobs = allJobs.map((job) => ({
//     id: job.id,
//     title: job.title,
//     description: job.description,
//     category: job.category,
//     zipcode: job.zip_code,
//     zipCode: job.zip_code,
//     status: job.status,
//     homeownerId: job.homeowner_id,
//     providerId: job.provider_id ?? null,
//     created_at: job.created_at,
//     updated_at: job.updated_at,
//   }));

//   res.status(200).json(jobs);
// });
const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
