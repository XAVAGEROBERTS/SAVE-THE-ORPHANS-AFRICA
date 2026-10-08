/**
 * Exchange rate fetcher with Next.js Data Cache.
 *
 * - Caches the rate for 1 hour (3600s) using Next.js's built-in fetch cache.
 * - Falls back to a safe default if the API is unreachable.
 * - Never throws — always returns a usable number so donations never break.
 */

const FALLBACK_USD_TO_UGX = 3700;
const CACHE_SECONDS = 60 * 60; // 1 hour

interface OpenExchangeRatesResponse {
  disclaimer?: string;
  license?: string;
  timestamp?: number;
  base?: string;
  rates?: Record<string, number>;
}

export async function getUsdToUgxRate(): Promise<{
  rate: number;
  source: "live" | "fallback";
  fetchedAt: string;
}> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;

  if (!apiKey) {
    console.warn(
      "[exchange-rate] EXCHANGE_RATE_API_KEY not set — using fallback rate"
    );
    return {
      rate: FALLBACK_USD_TO_UGX,
      source: "fallback",
      fetchedAt: new Date().toISOString(),
    };
  }

  try {
    const res = await fetch(
      `https://openexchangerates.org/api/latest.json?app_id=${apiKey}&base=USD&symbols=UGX`,
      {
        // Next.js will cache this fetch for 1 hour across all requests.
        next: { revalidate: CACHE_SECONDS, tags: ["exchange-rate"] },
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data: OpenExchangeRatesResponse = await res.json();
    const rate = data.rates?.UGX;

    if (typeof rate !== "number" || rate <= 0) {
      throw new Error("UGX rate missing or invalid in API response");
    }

    console.log(`[exchange-rate] live USD→UGX = ${rate}`);
    return {
      rate,
      source: "live",
      fetchedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    console.error(
      "[exchange-rate] fetch failed — using fallback:",
      err?.message || err
    );
    return {
      rate: FALLBACK_USD_TO_UGX,
      source: "fallback",
      fetchedAt: new Date().toISOString(),
    };
  }
}

/**
 * Convert USD to UGX at the current cached rate.
 * Returns integer UGX (Nylon requires integer amounts).
 */
export async function usdToUgx(amountUsd: number): Promise<{
  amount: number;
  rate: number;
  source: "live" | "fallback";
}> {
  const { rate, source } = await getUsdToUgxRate();
  return {
    amount: Math.round(amountUsd * rate),
    rate,
    source,
  };
}
