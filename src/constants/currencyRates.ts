import AsyncStorage from '@react-native-async-storage/async-storage';

export type CurrencyMeta = { name: string; symbol: string };

/** Display metadata for supported currencies (rates come from live API). */
export const CURRENCY_META: Record<string, CurrencyMeta> = {
    USD: { name: 'US Dollar', symbol: '$' },
    EUR: { name: 'Euro', symbol: '€' },
    GBP: { name: 'British Pound', symbol: '£' },
    JPY: { name: 'Japanese Yen', symbol: '¥' },
    CAD: { name: 'Canadian Dollar', symbol: 'C$' },
    AUD: { name: 'Australian Dollar', symbol: 'A$' },
    CHF: { name: 'Swiss Franc', symbol: 'Fr' },
    CNY: { name: 'Chinese Yuan', symbol: '¥' },
    INR: { name: 'Indian Rupee', symbol: '₹' },
    PKR: { name: 'Pakistani Rupee', symbol: 'Rs' },
    AED: { name: 'UAE Dirham', symbol: 'د.إ' },
    SAR: { name: 'Saudi Riyal', symbol: '﷼' },
    TRY: { name: 'Turkish Lira', symbol: '₺' },
    BRL: { name: 'Brazilian Real', symbol: 'R$' },
    MXN: { name: 'Mexican Peso', symbol: 'Mex$' },
    ZAR: { name: 'South African Rand', symbol: 'R' },
    SGD: { name: 'Singapore Dollar', symbol: 'S$' },
    HKD: { name: 'Hong Kong Dollar', symbol: 'HK$' },
    KRW: { name: 'South Korean Won', symbol: '₩' },
    NZD: { name: 'New Zealand Dollar', symbol: 'NZ$' },
};

export const CURRENCY_CODES = Object.keys(CURRENCY_META);

/** Fallback USD-based rates used only if network + cache are unavailable. */
export const FALLBACK_RATES: Record<string, number> = {
    USD: 1,
    EUR: 0.87,
    GBP: 0.74,
    JPY: 158,
    CAD: 1.4,
    AUD: 1.42,
    CHF: 0.81,
    CNY: 6.75,
    INR: 95.3,
    PKR: 283,
    AED: 3.67,
    SAR: 3.75,
    TRY: 47.7,
    BRL: 5.09,
    MXN: 17.16,
    ZAR: 16.22,
    SGD: 1.28,
    HKD: 7.85,
    KRW: 1416,
    NZD: 1.7,
};

const CACHE_KEY = '@utilityhub_fx_rates_v1';
const API_URL = 'https://open.er-api.com/v6/latest/USD';

export type RatesPayload = {
    rates: Record<string, number>;
    updatedAt: string;
    source: 'live' | 'cache' | 'fallback';
};

type CachedRates = {
    rates: Record<string, number>;
    updatedAt: string;
    fetchedAt: number;
};

function pickSupportedRates(all: Record<string, number>): Record<string, number> {
    const rates: Record<string, number> = { USD: 1 };
    for (const code of CURRENCY_CODES) {
        const value = all[code];
        if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
            rates[code] = value;
        } else if (FALLBACK_RATES[code] != null) {
            rates[code] = FALLBACK_RATES[code];
        }
    }
    return rates;
}

export function convertCurrency(
    amount: number,
    fromCode: string,
    toCode: string,
    rates: Record<string, number>,
): number {
    const from = rates[fromCode];
    const to = rates[toCode];
    if (!from || !to || !Number.isFinite(amount)) return 0;
    return (amount / from) * to;
}

export async function loadCachedRates(): Promise<RatesPayload | null> {
    try {
        const raw = await AsyncStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const cached: CachedRates = JSON.parse(raw);
        if (!cached?.rates) return null;
        return {
            rates: pickSupportedRates(cached.rates),
            updatedAt: cached.updatedAt || 'Cached rates',
            source: 'cache',
        };
    } catch {
        return null;
    }
}

export async function fetchLatestRates(): Promise<RatesPayload> {
    const response = await fetch(API_URL);
    if (!response.ok) {
        throw new Error(`FX request failed (${response.status})`);
    }

    const data = await response.json();
    if (data?.result !== 'success' || !data?.rates) {
        throw new Error('Invalid FX response');
    }

    const rates = pickSupportedRates(data.rates);
    const updatedAt =
        typeof data.time_last_update_utc === 'string'
            ? data.time_last_update_utc.replace(' +0000', ' UTC')
            : new Date().toUTCString();

    const cached: CachedRates = {
        rates,
        updatedAt,
        fetchedAt: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cached));

    return { rates, updatedAt, source: 'live' };
}

export async function getRates(preferFresh = true): Promise<RatesPayload> {
    const cached = await loadCachedRates();

    if (preferFresh) {
        try {
            return await fetchLatestRates();
        } catch {
            if (cached) return cached;
            return {
                rates: { ...FALLBACK_RATES },
                updatedAt: 'Offline fallback',
                source: 'fallback',
            };
        }
    }

    if (cached) return cached;

    try {
        return await fetchLatestRates();
    } catch {
        return {
            rates: { ...FALLBACK_RATES },
            updatedAt: 'Offline fallback',
            source: 'fallback',
        };
    }
}
