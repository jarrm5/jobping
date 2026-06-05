//const express = require("express");
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
//const app = express();
const prisma = new PrismaClient({
  adapter,
});
//app.use(express.json());
// Get all jobs
//app.get("/", async (req, res) => {
//  const jobCount = await prisma.jobs.count();
//  res.json(
//    jobCount == 0
//      ? "No jobs have been added yet."
//      : "Some jobs have been added to the database.",
//  );
//});
const PORT = 3000;
console.log(`Server is running on http://localhost:${PORT}`);
//app.listen(PORT, () => {
//  console.log(`Server is running on http://localhost:${PORT}`);
//});
