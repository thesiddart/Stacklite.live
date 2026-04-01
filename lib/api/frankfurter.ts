/**
 * Frankfurter Currency Conversion API
 * https://api.frankfurter.app
 *
 * Silent fail — returns null on error, never blocks the form.
 */

interface ExchangeRateResponse {
  amount: number
  base: string
  date: string
  rates: Record<string, number>
}

/**
 * Fetch live exchange rate for a given currency pair
 * @param from - Source currency code (e.g. 'USD')
 * @param to - Target currency code (e.g. 'NPR')
 * @returns The exchange rate, or null on failure
 */
export async function getExchangeRate(
  from: string,
  to: string
): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )

    if (!response.ok) return null

    const data: ExchangeRateResponse = await response.json()
    return data.rates[to] ?? null
  } catch {
    return null
  }
}

/**
 * Convert an amount from one currency to another
 * @returns Converted amount or null on failure
 */
export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number | null> {
  if (from === to) return amount
  if (amount <= 0) return null

  const rate = await getExchangeRate(from, to)
  if (rate === null) return null

  return Math.round(amount * rate * 100) / 100
}

/**
 * Format a number as a currency string with Nepali-style grouping
 * e.g. 318400 → "3,18,400"
 */
export function formatNPR(amount: number): string {
  const str = Math.round(amount).toString()

  if (str.length <= 3) return str

  const lastThree = str.slice(-3)
  const remaining = str.slice(0, -3)
  const grouped = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',')

  return `${grouped},${lastThree}`
}
