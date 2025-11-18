#!/usr/bin/env tsx

/**
 * Remote Database Population Script
 * Calls the /api/populate endpoint on your Vercel deployment
 */

import { createInterface } from "readline";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function getConfig() {
  // Check command line arguments first
  const args = process.argv.slice(2);
  let vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;
  let populateSecret = process.env.POPULATE_SECRET || process.env.VERCEL_POPULATE_SECRET;

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
      vercelUrl = args[i + 1];
      i++;
    } else if (args[i] === '--secret' && args[i + 1]) {
      populateSecret = args[i + 1];
      i++;
    } else if (args[i].startsWith('--url=')) {
      vercelUrl = args[i].split('=')[1];
    } else if (args[i].startsWith('--secret=')) {
      populateSecret = args[i].split('=')[1];
    }
  }

  if (!vercelUrl) {
    vercelUrl = await question("Enter your Vercel app URL (e.g., https://your-app.vercel.app): ");
    if (!vercelUrl) {
      console.error("❌ Vercel URL is required");
      rl.close();
      process.exit(1);
    }
  }

  if (!populateSecret) {
    populateSecret = await question("Enter POPULATE_SECRET (set in Vercel env vars): ");
    if (!populateSecret) {
      console.error("❌ POPULATE_SECRET is required");
      rl.close();
      process.exit(1);
    }
  }

  rl.close();
  return { vercelUrl, populateSecret };
}

async function populateRemote() {
  const { vercelUrl, populateSecret } = await getConfig();
  const url = `${vercelUrl}/api/populate`;

  console.log("\n🚀 Calling remote populate endpoint...");
  console.log(`📍 URL: ${url}`);
  console.log(`🔐 Using secret: ${populateSecret.substring(0, 4)}...\n`);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-populate-secret": populateSecret,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Error:", data.error || "Unknown error");
      if (data.details) {
        console.error("Details:", data.details);
      }
      process.exit(1);
    }

    console.log("\n✅ Success!");
    console.log("Message:", data.message);
    if (data.inserted) {
      console.log("\n📊 Inserted counts:");
      console.log(`  - Athletes: ${data.inserted.athletes}`);
      console.log(`  - Phases: ${data.inserted.phases}`);
      console.log(`  - Blocks: ${data.inserted.blocks}`);
      console.log(`  - Programs: ${data.inserted.programs}`);
    }
  } catch (error) {
    console.error("❌ Failed to call populate endpoint:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
    }
    process.exit(1);
  }
}

populateRemote();

