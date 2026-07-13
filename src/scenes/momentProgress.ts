export const BOUGHT_MOMENT_CARDS_STORAGE_KEY = "candybear2-bought-moment-cards";
/** Niveles completados seguidos sin comprar ningún upgrade. */
export const LEVELS_WITHOUT_UPGRADE_STORAGE_KEY = "candybear2-levels-without-upgrade";
/** Tras N niveles pudiendo comprar y sin upgradear, el panel ofrece "Buy upgrades". */
export const LEVELS_WITHOUT_UPGRADE_PROMPT_THRESHOLD = 3;

function readBoughtMomentCardsRecord() {
	if (typeof window === "undefined") {
		return {} as Record<string, boolean>;
	}

	try {
		const storedValue = window.localStorage.getItem(BOUGHT_MOMENT_CARDS_STORAGE_KEY);
		if (!storedValue) {
			return {} as Record<string, boolean>;
		}

		const parsedValue = JSON.parse(storedValue) as Record<string, unknown>;
		return Object.fromEntries(
			Object.entries(parsedValue)
				.filter(([, isBought]) => isBought === true)
				.map(([cardKey]) => [cardKey, true] as const)
		) as Record<string, boolean>;
	} catch {
		return {} as Record<string, boolean>;
	}
}

export function isMomentCardBought(cardNumber: number) {
	const normalizedCardNumber = Math.max(1, Math.floor(cardNumber));
	return readBoughtMomentCardsRecord()[String(normalizedCardNumber)] === true;
}

export function storeMomentCardAsBought(cardNumber: number) {
	if (typeof window === "undefined") {
		return;
	}

	const normalizedCardNumber = Math.max(1, Math.floor(cardNumber));
	const boughtCards = readBoughtMomentCardsRecord();

	boughtCards[String(normalizedCardNumber)] = true;
	window.localStorage.setItem(BOUGHT_MOMENT_CARDS_STORAGE_KEY, JSON.stringify(boughtCards));
	// Comprar un upgrade reinicia el recordatorio de "Buy upgrades".
	resetLevelsWithoutUpgradePurchase();
}

export function getLevelsWithoutUpgradePurchase() {
	if (typeof window === "undefined") {
		return 0;
	}

	const storedValue = window.localStorage.getItem(LEVELS_WITHOUT_UPGRADE_STORAGE_KEY);
	const parsedValue = Number.parseInt(storedValue ?? "0", 10);
	return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
}

/** +1 al terminar un día de campaña sin haber comprado upgrades. */
export function recordLevelClearedWithoutUpgradePurchase() {
	if (typeof window === "undefined") {
		return;
	}

	const nextValue = getLevelsWithoutUpgradePurchase() + 1;
	window.localStorage.setItem(LEVELS_WITHOUT_UPGRADE_STORAGE_KEY, String(nextValue));
}

export function resetLevelsWithoutUpgradePurchase() {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(LEVELS_WITHOUT_UPGRADE_STORAGE_KEY, "0");
}

/**
 * True si el jugador puede comprar un upgrade y lleva varios niveles
 * sin comprar ninguno.
 */
export function shouldPromptBuyUpgrades(canAffordUpgrade: boolean) {
	if (!canAffordUpgrade) {
		return false;
	}

	return getLevelsWithoutUpgradePurchase() >= LEVELS_WITHOUT_UPGRADE_PROMPT_THRESHOLD;
}