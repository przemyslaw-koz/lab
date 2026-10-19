export const handler = async (event) => {
  const scenario = event.paymentScenario ?? "SUCCESS";

  if (scenario === "DECLINED") {
    return {
      status: "DECLINED",
    };
  }

  if (scenario === "ERROR") {
    throw new Error("Injected payment processing error");
  }

  if (event.paymentScenario === "ERROR") {
    const error = new Error("Payment provider temporarily unavailable");
    error.name = "PaymentProviderError";
    throw error;
  }

  return {
    status: "SUCCEEDED",
    paymentId: `fake-${event.orderId}`,
  };
};
