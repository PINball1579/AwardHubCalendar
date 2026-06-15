import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(file: string): void {
  if (!existsSync(file)) return;
  const content = readFileSync(file, "utf8");
  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

const root = process.cwd();
const testEnv = resolve(root, ".env.test");
if (existsSync(testEnv)) {
  loadEnvFile(testEnv);
} else {
  loadEnvFile(resolve(root, ".env"));
}
