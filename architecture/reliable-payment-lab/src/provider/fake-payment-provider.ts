export class FakePaymentProvider implements PaymentProvider {
    async capture(payment: Payment): Promise<void> {
        console.log('Capturing payment', payment);
    }

    async checkPaymentStatus(payment: Payment): Promise<void> {
        console.log('Checking payment status', payment);
    }
}
