import "dotenv/config";
import express, { type Request, type Response } from "express";
import { PrismaClient } from "./prisma/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import createJobsRouter from "./src/routes/jobs.ts";

const databaseUrl = process.env.DATABASE_URL;
const app = express();

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

app.use("/jobs", createJobsRouter(prisma));

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
