import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

dotenv.config();

const OUTPUT_FILENAME = 'naukri_apply_links.csv';

// Use the exact collection name used in the server ("naukri")
const COLLECTION_NAME = 'naukri';

function isLikelyValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url === 'Not Found' || url === 'about:blank') return false;
  if (/invalid-url|\/404\/|\/404$|not.found|not.available/i.test(url)) return false;
  if (/^https?:\/\/(localhost|127\.0\.0\.1|example\.com)/i.test(url)) return false;
  return /^https?:\/\/.+\..+/i.test(url);
}

async function main() {
  const mongoUri = process.env.MONGO;
  if (!mongoUri) {
    console.error('Missing MONGO env. Please set MONGO in your .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);

    const collection = mongoose.connection.collection(COLLECTION_NAME);

    // Project only apply_link to reduce memory
    const cursor = collection.find({}, { projection: { apply_link: 1 } });

    const applyLinks = [];
    for await (const doc of cursor) {
      const link = doc.apply_link;
      if (isLikelyValidUrl(link)) {
        applyLinks.push(link.trim());
      }
    }

    const uniqueLinks = Array.from(new Set(applyLinks));

    const header = 'apply_link';
    const csvLines = [header, ...uniqueLinks.map((l) => JSON.stringify(l))];

    const outPath = path.resolve(process.cwd(), 'backend', 'scripts', OUTPUT_FILENAME);
    fs.writeFileSync(outPath, csvLines.join('\n'), 'utf8');

    // Also print to stdout
    console.log(header);
    uniqueLinks.forEach((l) => console.log(l));

    console.log(`\nSaved ${uniqueLinks.length} unique apply_links to: ${outPath}`);
  } catch (err) {
    console.error('Error exporting apply_links:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

main();


