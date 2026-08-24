import { spawn } from "node:child_process";
import { Transform } from "node:stream";
import { fileURLToPath } from "node:url";

const sensitiveFields = String.raw`email|phone|mobile|password|passwd|token|secret|authorization|cookie|api[-_]?key|firstName|lastName|fullName|company|addressLine1|addressLine2|city|state|postalCode|country|authority|signature|provided|expected|ref_id|userId|customerId|addressId|orderId|orderNumber|paymentId|transactionId|parameters|receptor|verificationCode|otp|nationalId|ip|clientIp|remoteAddress`;
const jsonSensitive = new RegExp(
  `("(?:${sensitiveFields})"\\s*:\\s*)(?:"(?:\\\\.|[^"\\\\])*"|-?\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?|true|false|null)`,
  "gi",
);
const inspectedSensitive = new RegExp(
  `(\\b(?:${sensitiveFields})\\b\\s*:\\s*)(?:\\[[^\\]]*\\]|'[^']*'|"[^\"]*"|[^\\s,}]+)`,
  "gi",
);
const keyedSensitive = new RegExp(
  `\\b(${sensitiveFields})=((?:"[^"]*")|(?:'[^']*')|[^\\s,;]+)`,
  "gi",
);

const sensitiveField = new RegExp(`^(?:${sensitiveFields})$`, "i");

function redactJsonTree(value) {
  if (Array.isArray(value)) return value.map(redactJsonTree);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      sensitiveField.test(key) ? "[REDACTED]" : redactJsonTree(child),
    ]),
  );
}

function jsonFragmentEnd(source, start) {
  const expectedClosers = [];
  let inString = false;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }

    if (character === '"') inString = true;
    else if (character === "{") expectedClosers.push("}");
    else if (character === "[") expectedClosers.push("]");
    else if (character === "}" || character === "]") {
      if (expectedClosers.pop() !== character) return -1;
      if (expectedClosers.length === 0) return index;
    }
  }

  return -1;
}

function redactJsonFragments(line) {
  let output = "";
  let cursor = 0;

  for (let index = 0; index < line.length; index += 1) {
    if (line[index] !== "{" && line[index] !== "[") continue;
    const end = jsonFragmentEnd(line, index);
    if (end < 0) continue;

    try {
      const parsed = JSON.parse(line.slice(index, end + 1));
      output += line.slice(cursor, index) + JSON.stringify(redactJsonTree(parsed));
      cursor = end + 1;
      index = end;
    } catch {
      // Bracketed log labels and util.inspect output are handled by later rules.
    }
  }

  return output + line.slice(cursor);
}

export function redactLogLine(line) {
  return redactJsonFragments(line)
    .replace(jsonSensitive, '$1"[REDACTED]"')
    .replace(inspectedSensitive, (value, prefix) => {
      const rawValue = value.slice(prefix.length);
      const quote = rawValue.startsWith("'") || rawValue.startsWith('"') ? rawValue[0] : "";
      return `${prefix}${quote}[REDACTED]${quote}`;
    })
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
    .replace(/\b(?:postgres(?:ql)?|mysql|redis):\/\/[^\s@]+@/gi, (value) =>
      value.replace(/:\/\/.*@/, "://[REDACTED]@"),
    )
    .replace(keyedSensitive, (_, key) => `${key}=[REDACTED]`)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]")
    .replace(/(?:\+98|0098|0)?[\s().-]*9(?:[\s().-]*\d){9}\b/g, "[REDACTED_PHONE]")
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[REDACTED_IP]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f-]{27,}\b/gi, "[REDACTED_ID]")
    .replace(/\b(user|customer)\s+[A-Za-z0-9_-]{8,}\b/gi, "$1 [REDACTED]");
}

class RedactionStream extends Transform {
  constructor() {
    super();
    this.pending = "";
  }

  _transform(chunk, _encoding, callback) {
    const parts = `${this.pending}${chunk.toString("utf8")}`.split(/(\r?\n)/);
    this.pending = parts.pop() ?? "";
    this.push(parts.map((part) => (/^\r?\n$/.test(part) ? part : redactLogLine(part))).join(""));
    callback();
  }

  _flush(callback) {
    if (this.pending) this.push(redactLogLine(this.pending));
    callback();
  }
}

function run() {
  const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
  const child = spawn(process.execPath, [nextBin, "start", ...process.argv.slice(2)], {
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
  });

  child.stdout.pipe(new RedactionStream()).pipe(process.stdout);
  child.stderr.pipe(new RedactionStream()).pipe(process.stderr);

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.on(signal, () => child.kill(signal));
  }

  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    else process.exitCode = code ?? 1;
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) run();
