import { getLevelStars } from "./levelProgress";
import { getTotalLikes } from "./likeProgress";

/** Cada N niveles hay un gate especial (5, 10, 15…). */
export const SPECIAL_LEVEL_GATE_INTERVAL = 5;

/** Estrellas máximas por nivel (para la curva de requisitos). */
export const MAX_STARS_PER_LEVEL = 3;

export interface SpecialLevelRequirements {
	stars: number;
	likes: number;
	coins: number;
}

const SPECIAL_LEVEL_PAID_STORAGE_KEY = "candybear2-special-gate-paid-levels";

function readPaidSpecialGateLevels() {
	if (typeof window === "undefined") {
		return {} as Record<string, number>;
	}

	try {
		const storedValue = window.localStorage.getItem(SPECIAL_LEVEL_PAID_STORAGE_KEY);
		if (!storedValue) {
			return {} as Record<string, number>;
		}

		const parsedValue = JSON.parse(storedValue) as Record<string, unknown>;
		return Object.fromEntries(
			Object.entries(parsedValue)
				.map(([levelKey, value]) => [levelKey, Number(value)] as const)
				.filter(([, value]) => Number.isFinite(value) && value >= 0)
		) as Record<string, number>;
	} catch {
		return {} as Record<string, number>;
	}
}

export function hasPaidSpecialGateEntry(levelNumber: number) {
	if (!isSpecialGateLevel(levelNumber)) {
		return true;
	}

	if (typeof window === "undefined") {
		return false;
	}

	return Boolean(readPaidSpecialGateLevels()[String(Math.floor(levelNumber))]);
}

export function markSpecialGateEntryPaid(levelNumber: number) {
	if (typeof window === "undefined" || !isSpecialGateLevel(levelNumber)) {
		return;
	}

	const paidLevels = readPaidSpecialGateLevels();
	paidLevels[String(Math.floor(levelNumber))] = 1;
	window.localStorage.setItem(SPECIAL_LEVEL_PAID_STORAGE_KEY, JSON.stringify(paidLevels));
}

/** True para niveles 5, 10, 15, … */
export function isSpecialGateLevel(levelNumber: number) {
	const normalized = Math.floor(levelNumber);
	return normalized >= SPECIAL_LEVEL_GATE_INTERVAL
		&& normalized % SPECIAL_LEVEL_GATE_INTERVAL === 0;
}

/**
 * Suma de estrellas de campaña (mejor marca por nivel).
 * Cada nivel aporta como máximo 3★.
 */
export function getTotalCampaignStars(maxLevel = 40) {
	let total = 0;

	for (let levelNumber = 1; levelNumber <= maxLevel; levelNumber++) {
		total += getLevelStars(levelNumber);
	}

	return total;
}

/**
 * Requisitos de estrellas/likes para un nivel-gate.
 *
 * Curva: usa una fracción creciente de las estrellas máximas posibles
 * en los niveles anteriores (cada uno da hasta 3★), más likes con
 * crecimiento suave (casi cuadrático) por índice de gate.
 *
 * | Nivel | ★ prev máx | ★ req | likes |
 * |   5   |     12     |   6   |   3   |
 * |  10   |     27     |  14   |   7   |
 * |  15   |     42     |  24   |  12   |
 * |  20   |     57     |  34   |  18   |
 * |  25   |     72     |  47   |  25   |
 * |  30   |     87     |  59   |  33   |
 * |  35   |    102     |  72   |  42   |
 * |  40   |    117     |  87   |  52   |
 */
export function getSpecialLevelRequirements(levelNumber: number): SpecialLevelRequirements {
	if (!isSpecialGateLevel(levelNumber)) {
		return { stars: 0, likes: 0, coins: 0 };
	}

	const gateIndex = Math.floor(levelNumber / SPECIAL_LEVEL_GATE_INTERVAL);
	const maxStarsBefore = Math.max(0, (levelNumber - 1) * MAX_STARS_PER_LEVEL);
	// ~48% en el primer gate → ~74% en el último.
	const starRatio = 0.48 + (gateIndex - 1) * 0.037;
	const stars = Math.max(
		MAX_STARS_PER_LEVEL,
		Math.round(maxStarsBefore * starRatio)
	);
	// Likes: 3, 7, 12, 18, 25, 33, 42, 52…
	const likes = Math.max(
		1,
		Math.round(gateIndex * 2.5 + gateIndex * gateIndex * 0.5)
	);
	// Costo de entrada por nivel especial: se paga 1 sola vez y no se vuelve a cobrar al reingresar.
	const coins = Math.max(25, Math.round(gateIndex * 14 + gateIndex * gateIndex * 4));

	return { stars, likes, coins };
}

export function meetsSpecialLevelRequirements(
	levelNumber: number,
	totalStars = getTotalCampaignStars(),
	totalLikes = getTotalLikes(),
	totalCoins = 0,
) {
	if (!isSpecialGateLevel(levelNumber)) {
		return true;
	}

	const requirements = getSpecialLevelRequirements(levelNumber);
	return totalStars >= requirements.stars
		&& totalLikes >= requirements.likes
		&& totalCoins >= requirements.coins;
}

/** Puede entrar al nivel (progreso de campaña + gate especial si aplica). */
export function canEnterLevel(
	levelNumber: number,
	highestUnlockedLevel: number,
	totalStars = getTotalCampaignStars(),
	totalLikes = getTotalLikes(),
	totalCoins = 0,
) {
	if (levelNumber > highestUnlockedLevel) {
		return false;
	}

	if (hasPaidSpecialGateEntry(levelNumber)) {
		return true;
	}

	return meetsSpecialLevelRequirements(levelNumber, totalStars, totalLikes, totalCoins);
}
