import { TwitterApi } from "twitter-api-v2";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(__dirname, "..", "data", "last-posted.json");
const API_URL = "https://messier-systems.vercel.app/api/substack";

async function main() {
  // Load state
  let state = { lastGuid: "" };
  try {
    state = JSON.parse(readFileSync(STATE_FILE, "utf-8"));
  } catch {
    // First run, no state file yet
  }

  // Fetch posts via our own API (Substack blocks GitHub Actions IPs directly)
  console.log("Fetching posts via messier-systems API...");
  const res = await fetch(API_URL);
  if (!res.ok) {
    console.error(`Failed to fetch posts: ${res.status}`);
    process.exit(1);
  }

  const data = await res.json();
  const items = data?.posts;
  if (!items || items.length === 0) {
    console.log("No items found");
    process.exit(0);
  }

  // Get the latest item
  const latest = items[0];
  const guid = latest.link;
  const title = latest.title;
  const link = latest.link;

  if (guid === state.lastGuid) {
    console.log("No new posts since last check");
    process.exit(0);
  }

  console.log(`New post found: "${title}"`);

  // Compose tweet — matches Mara's lowercase, minimal voice
  const tweet = `new on messinecessity: "${title.toLowerCase()}"\n\n${link}`;
  console.log(`Tweet: ${tweet}`);

  // Post to X
  const client = new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_SECRET,
  });

  try {
    const result = await client.v2.tweet(tweet);
    console.log(`Posted tweet: ${result.data.id}`);
  } catch (err) {
    console.error("Failed to post tweet:", err);
    process.exit(1);
  }

  // Update state
  state.lastGuid = guid;
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  console.log("State updated");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
