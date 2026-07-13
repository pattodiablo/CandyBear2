export const LEVEL_LIKES_STORAGE_KEY = "candybear2-level-likes";
export const TOTAL_LIKES_STORAGE_KEY = "candybear2-total-likes";
/** Likes dados por cada skin de osito (índice 0 = head/Pepe, 1 = headSkin1, …). */
export const BEAR_LIKES_STORAGE_KEY = "candybear2-bear-likes";

function readNumberRecord(storageKey: string) {
	if (typeof window === "undefined") {
		return {} as Record<string, number>;
	}

	try {
		const storedValue = window.localStorage.getItem(storageKey);
		if (!storedValue) {
			return {} as Record<string, number>;
		}

		const parsedValue = JSON.parse(storedValue) as Record<string, unknown>;
		return Object.fromEntries(
			Object.entries(parsedValue)
				.map(([key, likes]) => [key, Number(likes)] as const)
				.filter(([, likes]) => Number.isFinite(likes) && likes >= 0)
		) as Record<string, number>;
	} catch {
		return {} as Record<string, number>;
	}
}

function readLevelLikesRecord() {
	return readNumberRecord(LEVEL_LIKES_STORAGE_KEY);
}

function readBearLikesRecord() {
	return readNumberRecord(BEAR_LIKES_STORAGE_KEY);
}

export function getLevelLikes(levelNumber: number) {
	const normalizedLevel = Math.max(0, Math.floor(levelNumber));
	return readLevelLikesRecord()[String(normalizedLevel)] ?? 0;
}

export function storeLevelLikes(levelNumber: number, likes: number) {
	if (typeof window === "undefined") {
		return;
	}

	const normalizedLevel = Math.max(0, Math.floor(levelNumber));
	const normalizedLikes = Math.max(0, Math.floor(likes));
	const levelLikes = readLevelLikesRecord();
	const previousLikes = levelLikes[String(normalizedLevel)] ?? 0;

	levelLikes[String(normalizedLevel)] = Math.max(previousLikes, normalizedLikes);
	window.localStorage.setItem(LEVEL_LIKES_STORAGE_KEY, JSON.stringify(levelLikes));
}

export function getTotalLikes() {
	if (typeof window === "undefined") {
		return 0;
	}

	const storedValue = window.localStorage.getItem(TOTAL_LIKES_STORAGE_KEY);
	const parsedValue = Number.parseInt(storedValue ?? "0", 10);
	return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
}

export function recordLike() {
	if (typeof window === "undefined") {
		return;
	}

	const nextTotalLikes = getTotalLikes() + 1;
	window.localStorage.setItem(TOTAL_LIKES_STORAGE_KEY, String(nextTotalLikes));
}

/** Likes que ha dado un osito concreto (por skinIndex). */
export function getBearLikes(skinIndex: number) {
	const normalizedIndex = Math.max(0, Math.floor(skinIndex));
	return readBearLikesRecord()[String(normalizedIndex)] ?? 0;
}

/** Suma 1 like al contador del osito con ese skin. */
export function recordBearLike(skinIndex: number) {
	if (typeof window === "undefined") {
		return;
	}

	const normalizedIndex = Math.max(0, Math.floor(skinIndex));
	const bearLikes = readBearLikesRecord();
	const key = String(normalizedIndex);
	bearLikes[key] = (bearLikes[key] ?? 0) + 1;
	window.localStorage.setItem(BEAR_LIKES_STORAGE_KEY, JSON.stringify(bearLikes));
}

export function spendTotalLikes(amount: number) {
	if (typeof window === "undefined") {
		return false;
	}

	const normalizedAmount = Math.max(0, Math.floor(amount));
	const currentTotalLikes = getTotalLikes();

	if (currentTotalLikes < normalizedAmount) {
		return false;
	}

	window.localStorage.setItem(TOTAL_LIKES_STORAGE_KEY, String(currentTotalLikes - normalizedAmount));
	return true;
}

export function clearStoredLikes() {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.removeItem(LEVEL_LIKES_STORAGE_KEY);
	window.localStorage.removeItem(TOTAL_LIKES_STORAGE_KEY);
	window.localStorage.removeItem(BEAR_LIKES_STORAGE_KEY);
}