import { BODY_SKIN_MAX_INDEX } from "./clientBearCatalog";
import { isCookieJarAcquired } from "./unlockCatalog";

/** Stock persistente del tarro de galletas (se acumula entre niveles). */
export const COOKIE_STOCK_STORAGE_KEY = "candybear2-cookie-stock";

/** Tope de galletas que puede tener el tarro. */
export const MAX_COOKIE_STOCK = 30;

/** Galletas ganadas por cada estrella al completar un nivel. */
export const COOKIES_PER_STAR = 1;

/**
 * Regla simple: cada like añade exactamente 1 galleta al tarro, siempre que
 * la jar esté desbloqueada y aún no haya llegado al tope.
 */
export const LIKE_COOKIE_CHANCE_LOW_SKIN = 1;
export const LIKE_COOKIE_CHANCE_HIGH_SKIN = 1;

function clampStock(value: number) {
	return Math.min(MAX_COOKIE_STOCK, Math.max(0, Math.floor(value)));
}

export function getCookieStock() {
	if (typeof window === "undefined" || !isCookieJarAcquired()) {
		return 0;
	}

	const storedValue = window.localStorage.getItem(COOKIE_STOCK_STORAGE_KEY);
	const parsedValue = Number.parseInt(storedValue ?? "0", 10);
	return Number.isFinite(parsedValue) ? clampStock(parsedValue) : 0;
}

export function setCookieStock(stock: number) {
	if (typeof window === "undefined" || !isCookieJarAcquired()) {
		return 0;
	}

	const nextStock = clampStock(stock);
	window.localStorage.setItem(COOKIE_STOCK_STORAGE_KEY, String(nextStock));
	return nextStock;
}

/**
 * Añade galletas al tarro (respeta el tope de 30).
 * @returns cantidad realmente añadida
 */
export function addCookies(amount: number) {
	if (!isCookieJarAcquired()) {
		return 0;
	}

	const normalizedAmount = Math.max(0, Math.floor(amount));

	if (normalizedAmount <= 0) {
		return 0;
	}

	const currentStock = getCookieStock();
	const nextStock = clampStock(currentStock + normalizedAmount);
	setCookieStock(nextStock);
	return nextStock - currentStock;
}

/**
 * Gasta 1 galleta del stock persistente.
 * @returns true si se pudo gastar
 */
export function spendCookie() {
	if (!isCookieJarAcquired()) {
		return false;
	}

	const currentStock = getCookieStock();

	if (currentStock <= 0) {
		return false;
	}

	setCookieStock(currentStock - 1);
	return true;
}

/**
 * Un like siempre equivale a 1 galleta, sin probabilidades ni diferencias por skin.
 */
export function shouldLikeGrantCookie(_skinIndex: number) {
	return isCookieJarAcquired();
}

/**
 * Galletas al completar nivel: estrellas + bonus de upgrades.
 * Los likes suman galletas en el momento (estela → tarro), no al final.
 */
export function calculateCookiesEarnedFromLevel(
	stars: number,
	_likes: number = 0,
	extraBonus = 0
) {
	const fromStars = Math.max(0, Math.floor(stars)) * COOKIES_PER_STAR;
	const fromBonus = Math.max(0, Math.floor(extraBonus));
	return fromStars + fromBonus;
}

export function clearStoredCookieStock() {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.removeItem(COOKIE_STOCK_STORAGE_KEY);
}
