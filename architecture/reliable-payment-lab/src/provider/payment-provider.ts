export interface Payment {
    id: string;
    amount: number;
    currency: string;
}

export interface PaymentProvider {
    capture(payment: Payment): Promise<void>;
}
