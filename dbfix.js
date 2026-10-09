// dbfix.js
// One-time migration: move top-level myoperatorUserId/myoperatorName
// into basicDetails for all Employee documents.
//
// Run with:  node dbfix.js

import mongoose from "mongoose";
import dotenv from "dotenv";

// Load .env.local (falls back to .env if not found)
dotenv.config({ path: ".env.local" });
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "Employee-management-system";

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

async function run() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  console.log(`✅ Connected to ${DB_NAME}`);

  const collection = mongoose.connection.db.collection("employees");

  // -------- 1. Count what we're about to migrate --------
  const beforeCount = await collection.countDocuments({
    $or: [
      { myoperatorUserId: { $exists: true } },
      { myoperatorName: { $exists: true } },
    ],
  });
  console.log(`\n📊 Docs with top-level myoperator fields: ${beforeCount}`);

  if (beforeCount === 0) {
    console.log("✅ Nothing to migrate. All good.");
    await mongoose.disconnect();
    return;
  }

  // -------- 2. Run the migration --------
  console.log("\n🛠  Migrating...");
  const result = await collection.updateMany(
    {
      $or: [
        { myoperatorUserId: { $exists: true } },
        { myoperatorName: { $exists: true } },
      ],
    },
    [
      {
        $set: {
          "basicDetails.myoperatorUserId": {
            $ifNull: ["$myoperatorUserId", ""],
          },
          "basicDetails.myoperatorName": {
            $ifNull: ["$myoperatorName", ""],
          },
        },
      },
      { $unset: ["myoperatorUserId", "myoperatorName"] },
    ],
  );

  console.log(`✅ Matched:  ${result.matchedCount}`);
  console.log(`✅ Modified: ${result.modifiedCount}`);

  // -------- 3. Verify --------
  console.log("\n🔍 Verifying...");
  const sample = await collection
    .find(
      {},
      {
        projection: {
          "basicDetails.name": 1,
          "basicDetails.email": 1,
          "basicDetails.myoperatorUserId": 1,
          "basicDetails.myoperatorName": 1,
          myoperatorUserId: 1,
          myoperatorName: 1,
        },
      },
    )
    .limit(10)
    .toArray();

  console.log("\n📋 First 10 employees after migration:");
  sample.forEach((emp, i) => {
    console.log(
      `  ${i + 1}. ${emp?.basicDetails?.name || "(no name)"} | myopId: "${
        emp?.basicDetails?.myoperatorUserId ?? "(missing)"
      }" | topLevel myopId: ${emp?.myoperatorUserId ? "STILL EXISTS" : "gone ✅"}`,
    );
  });

  // -------- 4. Final summary --------
  const stillTopLevel = await collection.countDocuments({
    $or: [
      { myoperatorUserId: { $exists: true } },
      { myoperatorName: { $exists: true } },
    ],
  });
  console.log(
    `\n${stillTopLevel === 0 ? "✅" : "⚠️"} Docs still with top-level fields: ${stillTopLevel}`,
  );

  const withMyopId = await collection.countDocuments({
    "basicDetails.myoperatorUserId": { $exists: true, $ne: "" },
  });
  console.log(`📞 Employees with myoperatorUserId set: ${withMyopId}`);

  await mongoose.disconnect();
  console.log("\n🎉 Done.");
}

run().catch(async (err) => {
  console.error("❌ Migration failed:", err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});