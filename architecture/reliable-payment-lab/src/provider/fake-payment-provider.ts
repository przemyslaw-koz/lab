import fs from "node:fs";
import type { Payment, PaymentProvider } from "./payment-provider.js";

const FILE = ".provider-captured-payments.json";

export class FakePaymentProvider implements PaymentProvider {
  async capture(payment: Payment): Promise<void> {
    const captured: string[] = fs.existsSync(FILE)
      ? JSON.parse(fs.readFileSync(FILE, "utf8"))
      : [];

    if (captured.includes(payment.id)) {
      console.log(`♻️ Provider: ${payment.id} already captured`);
      return;
    }

    console.error(`❌ Provider: unavailable BEFORE capture`);
    throw new Error("Provider unavailable");

    console.log(`⏳ Provider: processing ${payment.id}...`);
    await new Promise((resolve) => setTimeout(resolve, 5000)); // simulate network delay

    console.log(`💰 Provider: CAPTURING ${payment.id}`);

    captured.push(payment.id);
    fs.writeFileSync(FILE, JSON.stringify(captured, null, 2));

    console.log(`✅ Provider: CAPTURED ${payment.id}`);
  }
}