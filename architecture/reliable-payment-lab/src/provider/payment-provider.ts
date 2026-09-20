export interface Payment {
  id: string;
  amount: number;
  currency: string;
}

export interface PaymentProvider {
  capture(payment: Payment): Promise<void>;
}

export class RetryableProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetryableProviderError";
  }
}

export class PermanentProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermanentProviderError";
  }
}

export class UnknownOutcomeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnknownOutcomeError";
  }
}
