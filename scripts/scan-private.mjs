import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const ignoredDirs = new Set([".git", "node_modules", ".demo-output"]);
const ignoredFiles = new Set(["scripts/scan-private.mjs"]);
const textExtensions = new Set(["", ".md", ".json", ".mjs", ".js", ".yml", ".yaml", ".txt"]);
const forbiddenExtensions = new Set([".db", ".sqlite", ".sqlite3", ".pem", ".key", ".p12", ".pfx", ".log"]);

const privateNames = [
  ["Ro", "sie"],
  ["Kl", "aus"],
  ["Bi", "rd"],
  ["As", "ahi"],
  ["Ro", "ok"]
].map((parts) => parts.join(""));

const checks = [
  ...privateNames.map((name) => ({ label: `private name: ${name}`, regex: new RegExp(`\\b${name}\\b`, "iu") })),
  { label: "macOS user path", regex: /\/Users\/[A-Za-z0-9._-]+\// },
  { label: "Linux privileged path", regex: /\/(?:root|home)\/[A-Za-z0-9._-]+\// },
  { label: "email address", regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu },
  { label: "private IPv4 address", regex: /\b(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})\b/ },
  { label: "localhost endpoint", regex: /https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?/i },
  { label: "internal hostname", regex: /\b[A-Za-z0-9.-]+\.(?:internal|lan|local)\b/i },
  { label: "common secret token", regex: /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{20,})\b/ },
  { label: "credential assignment", regex: /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|cookie|password)\b\s*[:=]\s*["'][^"']{8,}["']/i },
  { label: "private prompt assignment", regex: /\b(?:private|system)[_-]?prompt\b\s*[:=]/i },
  { label: "database file reference", regex: /\b[^\s"']+\.(?:sqlite|sqlite3|db)\b/i }
];

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

const files = walk(root);
const findings = [];
for (const path of files) {
  const rel = relative(root, path);
  if (forbiddenExtensions.has(extname(path).toLowerCase()) || /^\.env(?:\.|$)/.test(rel.split("/").at(-1))) {
    findings.push({ file: rel, line: 0, label: "forbidden private-data file type" });
    continue;
  }
  if (ignoredFiles.has(rel) || !textExtensions.has(extname(path))) continue;
  const content = readFileSync(path, "utf8");
  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    for (const check of checks) {
      if (check.regex.test(lines[index])) findings.push({ file: rel, line: index + 1, label: check.label });
      check.regex.lastIndex = 0;
    }
  }
}

if (findings.length) {
  console.error("Private-data scan: FAIL");
  for (const finding of findings) console.error(`- ${finding.file}:${finding.line} ${finding.label}`);
  process.exitCode = 1;
} else {
  console.log(`Private-data scan: PASS (${files.length} files checked, generated/dependency directories excluded)`);
}
