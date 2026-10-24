export const handler = async (event) => {
  const scenario = event.paymentScenario ?? "SUCCESS";

  if (scenario === "DECLINED") {
    return {
      status: "DECLINED",
    };
  }

  if (scenario === "ERROR_TWICE_THEN_SUCCESS") {
    if (event.retryCount < 2) {
      const error = new Error("Payment provider temporarily unavailable");
      error.name = "RetryablePaymentError";
      throw error;
    }

    return {
      status: "SUCCEEDED",
      paymentId: `fake-${event.orderId}`,
    };
  }

  if (event.paymentScenario === "ERROR") {
    const error = new Error("Payment provider temporarily unavailable");
    error.name = "RetryablePaymentError";
    throw error;
  }

  return {
    status: "SUCCEEDED",
    paymentId: `fake-${event.orderId}`,
  };
};
