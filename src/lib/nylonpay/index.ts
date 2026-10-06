import { createNylonPay } from "@nile-squad/nylonpay-ts";
import { randomUUID } from "crypto";

function getCredentials() {
  const apiKey = (process.env.NYLONPAY_API_KEY || "").trim();
  const apiSecret = (process.env.NYLONPAY_API_SECRET || "").trim();
  return { apiKey, apiSecret };
}

function getClient() {
  const { apiKey, apiSecret } = getCredentials();

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Nylon Pay keys missing. Set NYLONPAY_API_KEY and NYLONPAY_API_SECRET in .env.local"
    );
  }

  if (!apiKey.startsWith("npk_")) {
    throw new Error(
      `Invalid API key format. Expected npk_... Got prefix: ${apiKey.slice(0, 12)}`
    );
  }

  if (!apiSecret.startsWith("nps_")) {
    throw new Error(
      `Invalid API secret format. Expected nps_... Got prefix: ${apiSecret.slice(0, 12)}`
    );
  }

  return createNylonPay({ apiKey, apiSecret });
}

// ─────────────────────────────────────────────────────────────
// Mobile Money — Direct STK Push
// ─────────────────────────────────────────────────────────────

export interface CollectPaymentPayload {
  amount: number;
  currency: string;
  description: string;
  customer: {
    name: string;
    email?: string;
    phone: string;
  };
  merchantReference: string;
  metadata?: Record<string, string>;
}

export interface CollectPaymentResponse {
  success: boolean;
  reference?: string;
  status?: string;
  error?: string;
}

export async function collectDonation(
  payload: CollectPaymentPayload
): Promise<CollectPaymentResponse> {
  try {
    const nylonpay = getClient();

    if (!payload.customer.phone) {
      return {
        success: false,
        error: "Phone number required for Mobile Money",
      };
    }

    // Nylon Pay requires a UUID reference
    const paymentReference = randomUUID();

    await nylonpay.collectPayment({
      amount: Math.round(payload.amount),
      currency: payload.currency as any,
      description: payload.description,
      customer: {
        name: payload.customer.name || "Donor",
        phoneNumber: payload.customer.phone,
        email: payload.customer.email,
      },
      reference: paymentReference,
      metadata: {
        ...(payload.metadata || {}),
        merchant_reference: payload.merchantReference,
      } as Record<string, string>,
    });

    return {
      success: true,
      reference: paymentReference,
      status: "pending",
    };
  } catch (error: any) {
    console.error("collectDonation failed:", error);
    return {
      success: false,
      error: error?.message || "Failed to start payment",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Card — Hosted Invoice Page (reserved for future card support)
// ─────────────────────────────────────────────────────────────

export interface CreateInvoicePayload {
  amount: number;
  currency: string;
  description: string;
  customer: {
    name?: string;
    email: string;
    phone?: string;
  };
  merchantReference: string;
  metadata?: Record<string, string>;
}

export interface CreateInvoiceResponse {
  success: boolean;
  invoice_id?: string;
  payment_url?: string;
  reference?: string;
  error?: string;
}

export async function createInvoice(
  payload: CreateInvoicePayload
): Promise<CreateInvoiceResponse> {
  try {
    const nylonpay = getClient();

    const result = await nylonpay.createInvoice({
      amount: Math.round(payload.amount),
      currency: payload.currency as any,
      customerEmail: payload.customer.email,
      customerName: payload.customer.name,
      customerPhone: payload.customer.phone,
      description: payload.description,
      items: [
        {
          name: (payload.description || "Donation").slice(0, 100),
          quantity: 1,
          unitPrice: Math.round(payload.amount),
        },
      ],
      merchantReference: payload.merchantReference,
      metadata: (payload.metadata || {}) as Record<string, string>,
    });

    if (!result.isOk) {
      const err =
        typeof result.error === "string"
          ? result.error
          : JSON.stringify(result.error);
      return { success: false, error: err };
    }

    const data = result.value as any;
    return {
      success: true,
      invoice_id: data.id,
      payment_url: data.paymentLink || data.url,
      reference: data.invoiceNumber || data.id,
    };
  } catch (error: any) {
    console.error("createInvoice failed:", error);
    return {
      success: false,
      error: error?.message || "Failed to create invoice",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Payment Status Verification
// ─────────────────────────────────────────────────────────────

export async function verifyPayment(reference: string) {
  try {
    const nylonpay = getClient();
    const result = await nylonpay.getStatus({ reference });

    if (!result.isOk) {
      return {
        success: false,
        status: "pending" as const,
        error:
          typeof result.error === "string"
            ? result.error
            : "Failed to verify payment",
      };
    }

    const raw = String((result.value as any).status || "").toLowerCase();
    const statusMap: Record<
      string,
      "pending" | "completed" | "failed" | "cancelled"
    > = {
      pending: "pending",
      processing: "pending",
      on_hold: "pending",
      success: "completed",
      successful: "completed",
      completed: "completed",
      paid: "completed",
      failed: "failed",
      cancelled: "cancelled",
      canceled: "cancelled",
    };

    return {
      success: true,
      status: statusMap[raw] || "pending",
      amount: (result.value as any).amount,
      currency: (result.value as any).currency,
      reference: (result.value as any).reference || reference,
    };
  } catch (error: any) {
    return {
      success: false,
      status: "pending" as const,
      error: error?.message || "Failed to verify payment",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Webhook Signature Verification
// ─────────────────────────────────────────────────────────────

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): boolean {
  const secret = (process.env.NYLONPAY_WEBHOOK_SECRET || "").trim();
  if (!secret) {
    console.warn("NYLONPAY_WEBHOOK_SECRET not set — skipping verification");
    return true;
  }

  try {
    const nylonpay = getClient();
    return nylonpay.verifyWebhookSignature({
      payload,
      signature,
      secret,
    });
  } catch (err) {
    console.error("Webhook signature verify failed:", err);
    return false;
  }
}