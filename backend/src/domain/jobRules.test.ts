// import test from "node:test";
// import assert from "node:assert/strict";

// import { validateJobUpdateRules } from "./jobRules.ts";
// import { JobStatus } from "../../prisma/generated/prisma/enums.ts";

// test("OPEN jobs clear providerId", () => {
//   const result = validateJobUpdateRules(
//     { status: JobStatus.OPEN, provider_id: 99 },
//     { status: JobStatus.OPEN, providerId: 99 },
//   );

//   assert.deepEqual(result.provider_id, null);
//   assert.equal(result.status, JobStatus.OPEN);
// });

// test("OPEN jobs clear a providerId", () => {
//   const result = validateJobUpdateRules(
//     { status: JobStatus.OPEN, provider_id: null },
//     { status: JobStatus.OPEN, providerId: 123 },
//   );

//   assert.equal(result.status, JobStatus.OPEN);
//   assert.equal(result.provider_id, null);
// });

// test("CLAIMED jobs require a providerId", () => {
//   assert.throws(
//     () =>
//       validateJobUpdateRules(
//         { status: JobStatus.OPEN, provider_id: null },
//         { status: JobStatus.CLAIMED, providerId: null },
//       ),
//     /CLAIMED and COMPLETED jobs require a providerId/i,
//   );
// });
