const PESAPAL_BASE_URLS = {
  sandbox: "https://cybqa.pesapal.com/pesapalv3",
  live: "https://pay.pesapal.com/pesapalv3",
};

function getBaseUrl() {
  const env = process.env.PESAPAL_ENV || "sandbox";
  return PESAPAL_BASE_URLS[env as keyof typeof PESAPAL_BASE_URLS];
}

/**
 * Get an authentication token from Pesapal.
 * Tokens are valid for ~5 minutes; we fetch a fresh one each request.
 */
export async function getPesapalToken(): Promise<string> {
  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    throw new Error("Pesapal credentials not configured");
  }

  const res = await fetch(`${getBaseUrl()}/api/Auth/RequestToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pesapal auth failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.token;
}

/**
 * Register an IPN (Instant Payment Notification) URL.
 * Only needs to be done once — returns an ipn_id you reuse.
 */
export async function registerIPN(
  token: string,
  ipnUrl: string
): Promise<string> {
  const res = await fetch(`${getBaseUrl()}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: "GET",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pesapal IPN registration failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.ipn_id;
}

/**
 * Submit an order request. Returns a redirect URL where the donor pays.
 */
export async function submitOrder(
  token: string,
  payload: {
    id: string;
    currency: string;
    amount: number;
    description: string;
    callback_url: string;
    notification_id: string;
    billing_address: {
      email_address: string;
      phone_number?: string;
      first_name?: string;
      last_name?: string;
    };
  }
): Promise<{ redirect_url: string; order_tracking_id: string }> {
  const res = await fetch(`${getBaseUrl()}/api/Transactions/SubmitOrderRequest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pesapal order failed: ${res.status} ${text}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(`Pesapal error: ${JSON.stringify(data.error)}`);
  }

  return {
    redirect_url: data.redirect_url,
    order_tracking_id: data.order_tracking_id,
  };
}

/**
 * Query the status of a transaction.
 */
export async function getTransactionStatus(
  token: string,
  orderTrackingId: string
): Promise<any> {
  const res = await fetch(
    `${getBaseUrl()}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pesapal status check failed: ${res.status} ${text}`);
  }

  return res.json();
}