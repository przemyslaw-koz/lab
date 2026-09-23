import fs from "node:fs";
import {
    type Payment,
    type PaymentProvider,
    UnknownOutcomeError,
    RetryableProviderError,
    PermanentProviderError,
  } from "./payment-provider.js";

const FILE = ".provider-captured-payments.json";

export class FakePaymentProvider implements PaymentProvider {

    private errorBeforeCapture(payment: Payment): Error {
        const roll = Math.random();
         if (roll < 0.5) {
            return new RetryableProviderError(`Provider response lost before capture for ${payment.id}`);
        } else {
            return new PermanentProviderError(`Provider permanently rejected before capture for ${payment.id}`);
        }
    }

    private errorAfterCapture(payment: Payment): Error {
        return new UnknownOutcomeError(`Provider response lost after capture for ${payment.id}`);
    }

  async capture(payment: Payment): Promise<void> {
    const shouldFail = Math.random() < 0.10;
    const shouldFailBeforeCapture = Math.random() < 0.5;

    const captured: string[] = fs.existsSync(FILE)
      ? JSON.parse(fs.readFileSync(FILE, "utf8"))
      : [];

    if (captured.includes(payment.id)) {
      console.log(`♻️ Provider: ${payment.id} already captured`);
      return;
    }

    console.log(`⏳ Provider: processing ${payment.id}...`);
    // await new Promise((resolve) => setTimeout(resolve, 25_000)); // simulate network delay

    if(shouldFail && shouldFailBeforeCapture) {
        console.error(`💥 Provider: CRASHED BEFORE CAPTURE for ${payment.id}`);
        throw this.errorBeforeCapture(payment);
    }

    console.log(`💰 Provider: CAPTURING ${payment.id}`);

    captured.push(payment.id);
    fs.writeFileSync(FILE, JSON.stringify(captured, null, 2));

    if(shouldFail && !shouldFailBeforeCapture) {
        console.error(`💥 Provider: RESPONSE LOST AFTER CAPTURE for ${payment.id}`);
        throw this.errorAfterCapture(payment);
    }

    //console.error(`⏱️ Provider: RESPONSE LOST AFTER CAPTURE for ${payment.id}`);
    //throw new UnknownOutcomeError(
    //    `Provider response lost after capture for ${payment.id}`,
    //  );

    console.log(`✅ Provider: CAPTURED ${payment.id}`);
  }
}