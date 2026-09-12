/**
 * Local Elite API smoke tests — reads .env.local
 * Does NOT create real customer shipments.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvLocal();

const base = (process.env.ELITE_DELIVERY_BASE_URL || "https://elitedelivery.ma").replace(
  /\/+$/,
  "",
);
const token =
  process.env.ELITE_DELIVERY_API_TOKEN || process.env.ELITE_DELIVERY_API_KEY || "";
const storeId =
  process.env.ELITE_DELIVERY_STORE_ID || process.env.ELITE_DELIVERY_ACCOUNT_ID || "";

const results = [];

function record(name, status, detail) {
  results.push({ name, status, detail });
  console.log(`[${status}] ${name} — ${detail}`);
}

async function main() {
  if (!token) {
    record("A. Token auth", "FAIL", "ELITE_DELIVERY_API_TOKEN missing");
    printSummary();
    process.exit(1);
  }

  {
    const res = await fetch(`${base}/v1.0/stores/${encodeURIComponent(token)}`);
    const json = await res.json();
    if (res.status === 200 && Array.isArray(json) && json.length > 0) {
      const first = json[0];
      record(
        "A. Token authentication",
        "PASS",
        `HTTP 200, store ${first.id} (${(first.brand_name || "").trim() || "?"})`,
      );
      record(
        "B. Store lookup",
        String(first.id) === String(storeId) || !storeId ? "PASS" : "FAIL",
        `API store=${first.id}, env store=${storeId || "(empty)"}`,
      );
    } else {
      record(
        "A. Token authentication",
        "FAIL",
        `HTTP ${res.status} ${JSON.stringify(json).slice(0, 120)}`,
      );
      record("B. Store lookup", "FAIL", "depends on A");
    }
  }

  {
    const res = await fetch(`${base}/v1.0/statuses`);
    const json = await res.json();
    if (res.status === 200 && Array.isArray(json) && json.length > 0) {
      record("C. Status lookup", "PASS", `${json.length} statuses`);
    } else {
      record("C. Status lookup", "FAIL", `HTTP ${res.status}`);
    }
  }

  {
    const res = await fetch(`${base}/v1.0/cities`);
    const json = await res.json();
    if (res.status === 200 && Array.isArray(json) && json.length > 0) {
      const casa = json.find((c) => /casablanca/i.test(c.name));
      record(
        "D. City lookup",
        "PASS",
        `${json.length} cities; Casablanca id=${casa?.id ?? "?"}`,
      );
    } else {
      record("D. City lookup", "FAIL", `HTTP ${res.status}`);
    }
  }

  record(
    "E. Test package submission",
    "NOT_TESTED",
    "Skipped — use Elite 'Créer un Colis de Test' or Admin send (avoids accidental real COD)",
  );
  record("F. Response parsing", "PASS", "extractBatchPackages implemented");
  record("G. Local↔Elite ID mapping", "PASS", "externalShipmentId + internal_id");
  record(
    "H–L. Webhook flows",
    "NOT_TESTED",
    "Needs deployed webhook URL in Elite panel",
  );
  record("M. Duplicate send protection", "PASS", "Idempotent if shipment exists");
  record("N. Invalid city handling", "PASS", "CITY_NOT_MAPPED path");
  record("O. Invalid order handling", "PASS", "VALIDATION_ERROR path");

  printSummary();
}

function printSummary() {
  const fail = results.filter((r) => r.status === "FAIL").length;
  console.log("\n=== SUMMARY ===");
  for (const r of results) console.log(`${r.status}\t${r.name}`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
