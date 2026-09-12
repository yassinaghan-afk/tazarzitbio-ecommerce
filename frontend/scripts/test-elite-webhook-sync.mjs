/**
 * Local Elite ↔ Admin webhook sync test (no real Elite package create).
 * Seeds a temporary linked order, applies webhooks, verifies updates + idempotency.
 *
 * Run: node --experimental-strip-types scripts/test-elite-webhook-sync.mjs
 *  or: node scripts/test-elite-webhook-sync.mjs  (uses jiti)
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const root = resolve(__dirname, "..");

function loadEnv() {
  const p = resolve(root, ".env.local");
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

loadEnv();

async function loadApply() {
  try {
    const jiti = require("jiti")(resolve(root, "scripts/test-elite-webhook-sync.mjs"), {
      alias: { "@": root },
    });
    return jiti(resolve(root, "lib/delivery/service.ts")).applyEliteWebhook;
  } catch (e) {
    throw new Error(`Cannot load service.ts via jiti: ${e.message}`);
  }
}

async function main() {
  const applyEliteWebhook = await loadApply();
  const storePath = resolve(root, "data/store.json");
  if (!existsSync(storePath)) {
    console.error("FAIL: data/store.json missing");
    process.exit(1);
  }

  const backup = readFileSync(storePath, "utf8");
  const store = JSON.parse(backup);
  const orderId = `TEST-ELITE-SYNC-${Date.now()}`;
  const packageId = `CL-ELITE-TEST-${Date.now()}`;

  store.orders = store.orders || [];
  store.orders.unshift({
    orderId,
    customerName: "Elite Sync Test",
    phone: "0612345678",
    address: "Test address",
    city: "Casablanca",
    products: [
      {
        productId: "test",
        slug: "test",
        nameAr: "اختبار",
        image: "",
        offerId: "t1",
        offerLabel: "1",
        unitPrice: 100,
        quantity: 1,
      },
    ],
    subtotal: 100,
    shippingPrice: 0,
    total: 100,
    paymentMethod: "COD",
    orderStatus: "confirmed",
    deliveryStatus: "preparing",
    createdAt: new Date().toISOString(),
    shipment: {
      providerId: "elite",
      externalShipmentId: packageId,
      trackingNumber: packageId,
      internalId: orderId,
      externalStatus: "0",
      externalStatusName: "Nouveau colis",
      internalStatus: "new",
      syncState: "synced",
      elitePaymentStatus: "unknown",
      eliteLinkedAt: new Date().toISOString(),
      lastSyncAt: new Date().toISOString(),
      codExpected: 100,
      payoutStatus: "pending",
    },
    deliveryHistory: [],
  });
  store.delivery = store.delivery || {
    providers: { elite: { config: {}, secrets: {} } },
    processedWebhookEventIds: [],
    integrationLogs: [],
    webhookEvents: [],
  };
  writeFileSync(storePath, JSON.stringify(store, null, 2));

  try {
    const r1 = await applyEliteWebhook({
      package_id: packageId,
      notif_type: "ChangeStatus",
      delivery_status: 35,
      event_time: "2026-09-12 21:00:00",
    });
    const after1 = JSON.parse(readFileSync(storePath, "utf8"));
    const o1 = after1.orders.find((x) => x.orderId === orderId);
    if (o1?.shipment?.internalStatus !== "in_transit") {
      throw new Error(`expected in_transit got ${o1?.shipment?.internalStatus}`);
    }
    if (o1.orderStatus !== "shipped") {
      throw new Error(`expected orderStatus shipped got ${o1.orderStatus}`);
    }
    console.log("PASS status sync to in_transit / shipped", r1.orderId);

    const r2 = await applyEliteWebhook({
      package_id: packageId,
      notif_type: "ChangeStatus",
      delivery_status: 35,
      event_time: "2026-09-12 21:00:00",
    });
    if (!r2.duplicate) throw new Error("expected duplicate");
    console.log("PASS duplicate webhook ignored");

    await applyEliteWebhook({
      package_id: packageId,
      notif_type: "ChangeStatus",
      delivery_status: 3,
      event_time: "2026-09-12 22:00:00",
    });
    const after3 = JSON.parse(readFileSync(storePath, "utf8"));
    const o3 = after3.orders.find((x) => x.orderId === orderId);
    if (
      o3?.shipment?.internalStatus !== "delivered" ||
      o3.orderStatus !== "delivered"
    ) {
      throw new Error("delivered sync failed");
    }
    console.log("PASS delivered sync");

    await applyEliteWebhook({
      package_id: packageId,
      notif_type: "package_paid",
      delivery_status: 3,
      event_time: "2026-09-12 22:05:00",
    });
    const after4 = JSON.parse(readFileSync(storePath, "utf8"));
    const o4 = after4.orders.find((x) => x.orderId === orderId);
    if (o4?.shipment?.elitePaymentStatus !== "paid") {
      throw new Error("paid sync failed");
    }
    if (o4.paymentCollectionStatus !== "paid_to_company") {
      throw new Error("paymentCollectionStatus not updated");
    }
    console.log("PASS package_paid");

    const r5 = await applyEliteWebhook({
      package_id: "CL-ELITE-UNKNOWN-XYZ",
      notif_type: "ChangeStatus",
      delivery_status: 3,
      event_time: "2026-09-12 23:00:00",
    });
    if (!r5.unmatched) throw new Error("expected unmatched");
    const after5 = JSON.parse(readFileSync(storePath, "utf8"));
    const ev = (after5.delivery?.webhookEvents || []).find(
      (e) => e.packageId === "CL-ELITE-UNKNOWN-XYZ",
    );
    if (!ev || ev.processStatus !== "unmatched") {
      throw new Error("unmatched event missing");
    }
    console.log("PASS unmatched package logged");

    console.log("\nALL WEBHOOK SYNC TESTS PASSED");
  } finally {
    writeFileSync(storePath, backup);
    console.log("Restored store.json");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
