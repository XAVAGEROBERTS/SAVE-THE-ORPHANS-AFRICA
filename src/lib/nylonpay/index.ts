import { createNylonPay } from "@nile-squad/nylonpay-ts";
import { randomUUID } from "crypto";

function getCredentials() {
  const apiKey = (process.env.NYLONPAY_API_KEY || "").trim();
  const apiSecret = (process.env.NYLONPAY_API_SECRET || "").trim();
  return { apiKey, apiSecret };
}

export function getClient() {
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
      return { success: false, error: "Phone number required for Mobile Money" };
    }

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

    return { success: true, reference: paymentReference, status: "pending" };
  } catch (error: any) {
    console.error("collectDonation failed:", error);
    return { success: false, error: error?.message || "Failed to start payment" };
  }
}

// ─────────────────────────────────────────────────────────────
// Card / Hosted Invoice Page
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
    return { success: false, error: error?.message || "Failed to create invoice" };
  }
}

// ─────────────────────────────────────────────────────────────
// Payment / Invoice Status Verification
// ─────────────────────────────────────────────────────────────

type NormalizedStatus = "pending" | "completed" | "failed" | "cancelled";

function mapStatus(raw: string): NormalizedStatus {
  const s = raw.toLowerCase();
  const map: Record<string, NormalizedStatus> = {
    pending: "pending",
    processing: "pending",
    on_hold: "pending",
    issued: "pending",
    successful: "completed",
    success: "completed",
    completed: "completed",
    paid: "completed",
    failed: "failed",
    cancelled: "cancelled",
    canceled: "cancelled",
  };
  return map[s] || "pending";
}

export async function verifyPayment(reference: string) {
  try {
    const nylonpay = getClient();

    const statusResult = await nylonpay.getStatus({ reference });

    if (statusResult.isOk) {
      const value = statusResult.value as any;
      return {
        success: true,
        status: mapStatus(String(value.status || "")),
        rawStatus: String(value.status || ""),
        amount: value.amount,
        currency: value.currency,
        reference: value.reference || reference,
      };
    }

    const firstError =
      typeof statusResult.error === "string"
        ? statusResult.error
        : JSON.stringify(statusResult.error);

    const firstErrorLower = firstError.toLowerCase();
    const notFoundViaStatus =
      firstErrorLower.includes("not_found") ||
      firstErrorLower.includes("not found");

    if (notFoundViaStatus) {
      try {
        const txResult = await nylonpay.getTransaction({ id: reference });

        if (txResult.isOk) {
          const tx = txResult.value as any;
          return {
            success: true,
            status: mapStatus(String(tx.status || "")),
            rawStatus: String(tx.status || ""),
            amount: tx.amount,
            currency: tx.currency,
            reference: tx.reference || reference,
          };
        }

        const txError =
          typeof txResult.error === "string"
            ? txResult.error
            : JSON.stringify(txResult.error);

        return {
          success: false,
          status: "pending" as const,
          error: firstError,
          fallbackError: txError,
        };
      } catch (err: any) {
        return {
          success: false,
          status: "pending" as const,
          error: firstError,
          fallbackError: err?.message || "getTransaction failed",
        };
      }
    }

    return {
      success: false,
      status: "pending" as const,
      error: firstError,
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

/**
 * Verifies x-nylon-signature.
 * IMPORTANT: secret MUST be the dedicated webhook secret from
 * Dashboard → API Keys → Webhook Configuration — NOT NYLONPAY_API_SECRET.
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): boolean {
  const secret = (process.env.NYLONPAY_WEBHOOK_SECRET || "").trim();

  if (!secret) {
    console.error(
      "[webhook] NYLONPAY_WEBHOOK_SECRET is not set. Refusing to accept webhooks."
    );
    return false;
  }

  if (!signature) {
    console.error("[webhook] Missing x-nylon-signature header");
    return false;
  }

  try {
    const nylonpay = getClient();
    const result = nylonpay.verifyWebhookSignature({
      payload,
      signature,
      secret,
      // Default is 300s. Wider window is safer for cold starts / retries.
      toleranceSeconds: 900,
    });

    if (!result) {
      console.error("[webhook] Signature verification returned false", {
        secretPrefix: secret.slice(0, 6),
        signaturePrefix: signature.slice(0, 16),
        payloadLength:
          typeof payload === "string" ? payload.length : payload.byteLength,
      });
    }

    return result;
  } catch (err: any) {
    console.error("[webhook] verifyWebhookSignature threw:", err?.message);
    return false;
  }
}