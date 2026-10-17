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

  return {
    status: "SUCCEEDED",
    paymentId: `fake-${event.orderId}`,
  };
};
