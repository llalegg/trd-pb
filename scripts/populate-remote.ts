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

  const hasArgs = args.length > 0;
  
  if (!vercelUrl) {
    if (hasArgs) {
      console.error("❌ Vercel URL is required. Use --url=https://your-app.vercel.app");
      rl.close();
      process.exit(1);
    }
    vercelUrl = await question("Enter your Vercel app URL (e.g., https://your-app.vercel.app): ");
    if (!vercelUrl) {
      console.error("❌ Vercel URL is required");
      rl.close();
      process.exit(1);
    }
  }

  // POPULATE_SECRET is optional - if not set in Vercel, the endpoint will be open
  if (!populateSecret && !hasArgs) {
    const answer = await question("POPULATE_SECRET not set. Press Enter to continue without secret (or type secret if you have one): ");
    populateSecret = answer.trim() || undefined;
  }

  rl.close();
  return { vercelUrl, populateSecret };
}

async function populateRemote() {
  const { vercelUrl, populateSecret } = await getConfig();
  const url = `${vercelUrl}/api/populate`;

  console.log("\n🚀 Calling remote populate endpoint...");
  console.log(`📍 URL: ${url}`);
  if (populateSecret) {
    console.log(`🔐 Using secret: ${populateSecret.substring(0, 4)}...\n`);
  } else {
    console.log(`⚠️  No secret provided - endpoint must be open\n`);
  }
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (populateSecret) {
    headers["x-populate-secret"] = populateSecret;
  }
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
    });

    const contentType = response.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error("❌ Received non-JSON response:");
      console.error("Status:", response.status, response.statusText);
      console.error("Content-Type:", contentType);
      console.error("Response:", text.substring(0, 500));
      process.exit(1);
    }

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

