import { BODY_SKIN_MAX_INDEX } from "./clientBearCatalog";

/** Stock persistente del tarro de galletas (se acumula entre niveles). */
export const COOKIE_STOCK_STORAGE_KEY = "candybear2-cookie-stock";

/** Tope de galletas que puede tener el tarro. */
export const MAX_COOKIE_STOCK = 30;

/** Galletas ganadas por cada estrella al completar un nivel. */
export const COOKIES_PER_STAR = 1;

/**
 * Chance de que un like envíe galleta al tarro según el "nivel" del osito (skin).
 * Skins bajos (tempranos): más fiables. Skins altos: más exigentes / menos fiables.
 */
export const LIKE_COOKIE_CHANCE_LOW_SKIN = 0.58;
export const LIKE_COOKIE_CHANCE_HIGH_SKIN = 0.28;

function clampStock(value: number) {
	return Math.min(MAX_COOKIE_STOCK, Math.max(0, Math.floor(value)));
}

export function getCookieStock() {
	if (typeof window === "undefined") {
		return 0;
	}

	const storedValue = window.localStorage.getItem(COOKIE_STOCK_STORAGE_KEY);
	const parsedValue = Number.parseInt(storedValue ?? "0", 10);
	return Number.isFinite(parsedValue) ? clampStock(parsedValue) : 0;
}

export function setCookieStock(stock: number) {
	if (typeof window === "undefined") {
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
	const currentStock = getCookieStock();

	if (currentStock <= 0) {
		return false;
	}

	setCookieStock(currentStock - 1);
	return true;
}

/**
 * Probabilidad de que un like del osito (skinIndex) sume 1 galleta al tarro.
 * No es garantizado: varía con el nivel/tier del personaje.
 */
export function shouldLikeGrantCookie(skinIndex: number) {
	const normalizedIndex = Math.max(0, Math.min(BODY_SKIN_MAX_INDEX, Math.floor(skinIndex)));
	const progress = BODY_SKIN_MAX_INDEX > 0
		? normalizedIndex / BODY_SKIN_MAX_INDEX
		: 0;
	const chance = LIKE_COOKIE_CHANCE_LOW_SKIN
		+ (LIKE_COOKIE_CHANCE_HIGH_SKIN - LIKE_COOKIE_CHANCE_LOW_SKIN) * progress;
	return Math.random() < chance;
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
