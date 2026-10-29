import "dotenv/config";
import { createApp } from "./src/config/app.ts";
import { createPrismaClient } from "./src/config/database.ts";
import { logEligibleProvidersForOpenJobs } from "./src/services/providerMatchingService.ts";

const prisma = createPrismaClient();
const app = createApp(prisma);

logEligibleProvidersForOpenJobs(prisma);

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
