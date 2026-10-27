// fixmaidb.js


import "dotenv/config";
import { MongoClient } from "mongodb";

const OLD_EMAIL = "janvi@promozionebranding.com";
const NEW_EMAIL = "janvi@inquirybazaar.com";

const URI = process.env.MONGODB_URI;

if (!URI) {
  console.error("❌ MONGODB_URI is missing from .env");
  process.exit(1);
}

const SYSTEM_DATABASES = new Set(["admin", "local", "config"]);
const client = new MongoClient(URI);

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function replaceEmail(value, stats) {
  if (typeof value === "string") {
    const count = value.split(OLD_EMAIL).length - 1;
    stats.values += count;
    return count ? value.split(OLD_EMAIL).join(NEW_EMAIL) : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => replaceEmail(item, stats));
  }

  // Preserve ObjectId, Date, Binary, Decimal128, and other BSON values.
  if (!isPlainObject(value)) return value;

  const result = {};

  for (const [key, item] of Object.entries(value)) {
    const newKey = key.split(OLD_EMAIL).join(NEW_EMAIL);
    stats.keys += key.split(OLD_EMAIL).length - 1;

    if (Object.hasOwn(result, newKey)) {
      throw new Error(
        `Field-name collision while replacing email in key "${key}"`
      );
    }

    result[newKey] = replaceEmail(item, stats);
  }

  return result;
}

function countEmail(value) {
  if (typeof value === "string") {
    return value.split(OLD_EMAIL).length - 1;
  }

  if (Array.isArray(value)) {
    return value.reduce((sum, item) => sum + countEmail(item), 0);
  }

  if (isPlainObject(value)) {
    return Object.entries(value).reduce(
      (sum, [key, item]) =>
        sum + key.split(OLD_EMAIL).length - 1 + countEmail(item),
      0
    );
  }

  return 0;
}

async function main() {
  let updatedDocuments = 0;
  let failedDocuments = 0;
  let replacedValues = 0;
  let replacedKeys = 0;
  let remaining = 0;

  try {
    await client.connect();

    const admin = client.db("admin");
    const { databases } = await admin.admin().listDatabases({
      nameOnly: true,
    });

    const targets = databases.filter(
      ({ name }) => !SYSTEM_DATABASES.has(name)
    );

    console.log(`Accessible application databases: ${targets.length}`);

    for (const { name: dbName } of targets) {
      const db = client.db(dbName);
      console.log(`\n📂 Database: ${dbName}`);

      const collections = await db
        .listCollections({}, { nameOnly: false })
        .toArray();

      const writableCollections = collections.filter(
        (collection) => collection.type === "collection"
      );

      console.log(`Collections: ${writableCollections.length}`);

      for (const { name: collectionName } of writableCollections) {
        const collection = db.collection(collectionName);
        let collectionUpdated = 0;

        for await (const document of collection.find({})) {
          const stats = { values: 0, keys: 0 };
          const { _id, ...body } = document;

          let updatedBody;
          try {
            updatedBody = replaceEmail(body, stats);
          } catch (error) {
            failedDocuments++;
            console.error(
              `❌ ${dbName}.${collectionName}, _id=${String(_id)}:`,
              error.message
            );
            continue;
          }

          if (stats.values === 0 && stats.keys === 0) continue;

          try {
            await collection.replaceOne(
              { _id },
              { ...updatedBody, _id }
            );

            updatedDocuments++;
            collectionUpdated++;
            replacedValues += stats.values;
            replacedKeys += stats.keys;
          } catch (error) {
            failedDocuments++;
            console.error(
              `❌ ${dbName}.${collectionName}, _id=${String(_id)}:`,
              error.message
            );
          }
        }

        if (collectionUpdated > 0) {
          console.log(
            `✅ ${collectionName}: updated ${collectionUpdated} document(s)`
          );
        }
      }
    }

    console.log("\n========== UPDATE SUMMARY ==========");
    console.log(`Documents updated: ${updatedDocuments}`);
    console.log(`Occurrences in values replaced: ${replacedValues}`);
    console.log(`Occurrences in field names replaced: ${replacedKeys}`);
    console.log(`Documents that failed: ${failedDocuments}`);

    console.log("\n========== VERIFICATION ==========");

    for (const { name: dbName } of targets) {
      const db = client.db(dbName);
      const collections = await db
        .listCollections({}, { nameOnly: false })
        .toArray();

      for (const { name, type } of collections) {
        if (type !== "collection") continue;

        for await (const document of db.collection(name).find({})) {
          remaining += countEmail(document);
        }
      }
    }

    console.log(`Remaining occurrences in scanned documents: ${remaining}`);

    if (remaining === 0 && failedDocuments === 0) {
      console.log("✅ No old-email occurrences remain in scanned documents.");
    } else {
      console.log("⚠️ Review remaining occurrences and failed documents.");
    }
  } catch (error) {
    console.error("❌ Operation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
