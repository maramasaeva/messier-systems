import { TwitterApi } from "twitter-api-v2";
import { XMLParser } from "fast-xml-parser";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const STATE_FILE = join(__dirname, "..", "data", "last-posted.json");
const FEED_URL = "https://messinecessity.substack.com/feed";

async function main() {
  // Load state
  let state = { lastGuid: "" };
  try {
    state = JSON.parse(readFileSync(STATE_FILE, "utf-8"));
  } catch {
    // First run, no state file yet
  }

  // Fetch RSS feed
  console.log("Fetching Substack RSS feed...");
  const res = await fetch(FEED_URL, {
    headers: { "User-Agent": "messier-systems/1.0 (substack-to-x bot)" },
  });
  if (!res.ok) {
    console.error(`Failed to fetch feed: ${res.status}`);
    process.exit(1);
  }

  const xml = await res.text();
  const parser = new XMLParser();
  const feed = parser.parse(xml);

  const items = feed?.rss?.channel?.item;
  if (!items || items.length === 0) {
    console.log("No items in feed");
    process.exit(0);
  }

  // Get the latest item (first in RSS)
  const latest = Array.isArray(items) ? items[0] : items;
  const guid = latest.guid || latest.link;
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
