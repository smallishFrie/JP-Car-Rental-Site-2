import "server-only";

import { readServerEnv } from "@/lib/env";

type XenditSessionResponse = {
  payment_session_id?: string;
  components_sdk_key?: string;
  message?: string;
};

function xenditAuthHeader(secretKey: string) {
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

export async function createXenditComponentsPaymentSession(input: {
  bookingId: string;
  amountPhp: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  origins: string[];
}) {
  const secretKey = readServerEnv("XENDIT_SECRET_KEY");
  const customerRef = `cust-${crypto.randomUUID()}`;

  const response = await fetch("https://api.xendit.co/sessions", {
    method: "POST",
    headers: {
      Authorization: xenditAuthHeader(secretKey),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reference_id: input.bookingId,
      session_type: "PAY",
      mode: "COMPONENTS",
      amount: Number(input.amountPhp.toFixed(2)),
      currency: "PHP",
      country: "PH",
      customer: {
        reference_id: customerRef,
        type: "INDIVIDUAL",
        email: input.customerEmail || undefined,
        mobile_number: input.customerPhone || undefined,
        individual_detail: { given_names: input.customerName },
      },
      components_configuration: {
        origins: input.origins,
      },
    }),
  });

  const payload = (await response.json()) as XenditSessionResponse;
  if (!response.ok || !payload.payment_session_id || !payload.components_sdk_key) {
    throw new Error(payload.message || "Failed to create payment session.");
  }

  return {
    paymentSessionId: payload.payment_session_id,
    componentsSdkKey: payload.components_sdk_key,
    raw: payload as unknown as Record<string, unknown>,
  };
}

export function verifyXenditWebhookToken(callbackTokenHeader: string | null) {
  const token = readServerEnv("XENDIT_WEBHOOK_VERIFICATION_TOKEN");
  return Boolean(callbackTokenHeader && callbackTokenHeader === token);
}
