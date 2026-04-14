export type PocPaymentStatus = "success" | "declined" | "failed";

export type PocPaymentResponse = {
  ok: boolean;
  status: PocPaymentStatus;
  subscriptionUpdated: boolean;
};

export async function submitPocPayment(cardNumber: string): Promise<PocPaymentResponse> {
  const response = await fetch("/api/subscription/poc-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ cardNumber }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error || "Nepodařilo se zpracovat PoC platbu");
  }

  return response.json();
}
