//const express = require("express");
import "dotenv/config";
import express from "express";
import { PrismaClient, type Job } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Missing DATABASE_URL. Add it to your .env file, e.g. DATABASE_URL=postgresql://user:password@localhost:5432/jobping?schema=public",
  );
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});
const app = express();
const prisma = new PrismaClient({
  adapter,
});

//cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

app.use(express.json());
//Get all jobs
app.get("/jobs", async (req, res) => {
  const jobCount = await prisma.job.count();
  const allJobs = await prisma.job.findMany();
  res
    .status(200)
    .json(
      jobCount == 0
        ? "No jobs have been added yet."
        : `${jobCount} jobs have been added to the database\n.` +
            allJobs.map(
              (job: Job) =>
                `\n${job.title} - ${job.description} - ${job.category}\n`,
            ),
    );
});
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
