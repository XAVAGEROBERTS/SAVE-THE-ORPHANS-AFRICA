// src/lib/pesapal/index.ts

const isLive = process.env.PESAPAL_ENVIRONMENT === "live";
const BASE_URL = isLive
  ? "https://pay.pesapal.com/v3/api"
  : "https://cybqa.pesapal.com/pesapalv3/api";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) {
    return cachedToken.token;
  }

  const key = process.env.PESAPAL_CONSUMER_KEY?.trim();
  const secret = process.env.PESAPAL_CONSUMER_SECRET?.trim();

  if (!key || !secret) {
    throw new Error(
      "Missing PESAPAL_CONSUMER_KEY or PESAPAL_CONSUMER_SECRET in environment"
    );
  }

  const res = await fetch(`${BASE_URL}/Auth/RequestToken`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      consumer_key: key,
      consumer_secret: secret,
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.token) {
    throw new Error(
      data.message ||
        data.error?.message ||
        JSON.stringify(data) ||
        "Pesapal auth failed"
    );
  }

  cachedToken = {
    token: data.token,
    expiresAt: Date.now() + 4.5 * 60 * 1000,
  };

  return data.token;
}

export async function registerIPN(
  url: string,
  type: "GET" | "POST" = "POST"
) {
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url,
      ipn_notification_type: type,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to register IPN");
  }
  return data;
}

interface SubscriptionDetails {
  start_date: string; // dd-MM-yyyy
  end_date: string;   // dd-MM-yyyy
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
}

export async function submitOrder(params: {
  id: string;
  amount: number;
  currency: string;
  description: string;
  callbackUrl: string;
  cancellationUrl?: string;
  billingAddress: {
    email_address?: string;
    phone_number?: string;
    country_code?: string;
    first_name?: string;
    last_name?: string;
  };
  // Recurring payment fields
  accountNumber?: string;
  subscription?: SubscriptionDetails;
}) {
  const token = await getAccessToken();
  const notificationId = process.env.PESAPAL_IPN_ID;

  if (!notificationId) {
    throw new Error(
      "PESAPAL_IPN_ID is not set. Register an IPN first and add the id to .env"
    );
  }

  const body: Record<string, any> = {
    id: params.id,
    currency: params.currency,
    amount: params.amount,
    description: params.description,
    callback_url: params.callbackUrl,
    cancellation_url: params.cancellationUrl,
    notification_id: notificationId,
    billing_address: params.billingAddress,
  };

  // Add recurring payment fields if provided
  if (params.accountNumber) {
    body.account_number = params.accountNumber;
  }

  if (params.subscription) {
    body.subscription_details = params.subscription;
  }

  const res = await fetch(`${BASE_URL}/Transactions/SubmitOrderRequest`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok || String(data.status) !== "200") {
    throw new Error(
      data.message || data.error?.message || "Failed to create Pesapal order"
    );
  }

  return data;
}

export async function getTransactionStatus(orderTrackingId: string) {
  const token = await getAccessToken();

  const res = await fetch(
    `${BASE_URL}/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to get transaction status");
  }
  return data;
}