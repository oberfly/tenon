const fs = require("fs");
const path = require("path");

const dir = path.resolve(__dirname, "../src/content/posts");
const files = fs.readdirSync(dir);
const f = files.find(x => x.includes("ai-agent"));
if (!f) { console.log("FILE NOT FOUND"); process.exit(1); }

const c = fs.readFileSync(path.join(dir, f), "utf8");

// Test original script regex
const m1 = c.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
console.log("Original regex match:", !!m1);

// Test CRLF-safe regex
const m2 = c.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
console.log("CRLF-safe regex match:", !!m2);

const m = m2;
if (!m) { console.log("NO MATCH"); process.exit(1); }

const lines = m[1].split("\n");
for (const line of lines) {
  const colonIdx = line.indexOf(":");
  if (colonIdx === -1) continue;
  const key = line.substring(0, colonIdx).trim();
  let value = line.substring(colonIdx + 1).trim();
  console.log(`  key=${JSON.stringify(key)} raw_value=${JSON.stringify(value)}`);

  // Replicate import script logic
  if (value.startsWith("[") && value.endsWith("]")) {
    console.log("  -> array");
  } else if (value === "true" || value === "false") {
    console.log("  -> boolean:", value === "true");
  } else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
    console.log("  -> unquoted:", JSON.stringify(value));
  }
}
