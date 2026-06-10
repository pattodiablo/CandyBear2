const STORAGE_KEY = "candybear2-highest-completed-level";
const TOTAL_COINS_STORAGE_KEY = "candybear2-total-coins";
const LEVEL_STARS_STORAGE_KEY = "candybear2-level-stars";
const FIRST_SESSION_STORAGE_KEY = "candybear2-has-opened-before";

export function getHighestCompletedLevel() {
	if (typeof window === "undefined") {
		return 0;
	}

	const storedValue = window.localStorage.getItem(STORAGE_KEY);
	const parsedValue = Number.parseInt(storedValue ?? "0", 10);
	return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
}

export function storeCompletedLevel(levelNumber: number) {
	if (typeof window === "undefined") {
		return;
	}

	const normalizedLevel = Math.max(0, Math.floor(levelNumber));
	const highestCompletedLevel = getHighestCompletedLevel();
	window.localStorage.setItem(STORAGE_KEY, String(Math.max(highestCompletedLevel, normalizedLevel)));
}

export function getStoredTotalCoins() {
	if (typeof window === "undefined") {
		return 0;
	}

	const storedValue = window.localStorage.getItem(TOTAL_COINS_STORAGE_KEY);
	const parsedValue = Number.parseInt(storedValue ?? "0", 10);
	return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
}

export function storeTotalCoins(totalCoins: number) {
	if (typeof window === "undefined") {
		return;
	}

	const normalizedTotalCoins = Math.max(0, Math.floor(totalCoins));
	window.localStorage.setItem(TOTAL_COINS_STORAGE_KEY, String(normalizedTotalCoins));
}

export function hasOpenedGameBefore() {
	if (typeof window === "undefined") {
		return true;
	}

	return window.localStorage.getItem(FIRST_SESSION_STORAGE_KEY) === "1";
}

export function markGameAsOpened() {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(FIRST_SESSION_STORAGE_KEY, "1");
}

export function getHighestUnlockedLevel(maxLevel: number) {
	return Math.min(maxLevel, Math.max(1, getHighestCompletedLevel() + 1));
}

function readLevelStarsRecord() {
	if (typeof window === "undefined") {
		return {} as Record<string, number>;
	}

	try {
		const storedValue = window.localStorage.getItem(LEVEL_STARS_STORAGE_KEY);
		if (!storedValue) {
			return {} as Record<string, number>;
		}

		const parsedValue = JSON.parse(storedValue) as Record<string, unknown>;
		return Object.fromEntries(
			Object.entries(parsedValue)
				.map(([levelKey, stars]) => [levelKey, Number(stars)] as const)
				.filter(([, stars]) => Number.isFinite(stars) && stars >= 0)
		) as Record<string, number>;
	} catch {
		return {} as Record<string, number>;
	}
}

export function getLevelStars(levelNumber: number) {
	const normalizedLevel = Math.max(0, Math.floor(levelNumber));
	return readLevelStarsRecord()[String(normalizedLevel)] ?? 0;
}

export function storeLevelStars(levelNumber: number, stars: number) {
	if (typeof window === "undefined") {
		return;
	}

	const normalizedLevel = Math.max(0, Math.floor(levelNumber));
	const normalizedStars = Math.min(3, Math.max(0, Math.floor(stars)));
	const levelStars = readLevelStarsRecord();
	const previousStars = levelStars[String(normalizedLevel)] ?? 0;

	levelStars[String(normalizedLevel)] = Math.max(previousStars, normalizedStars);
	window.localStorage.setItem(LEVEL_STARS_STORAGE_KEY, JSON.stringify(levelStars));
}