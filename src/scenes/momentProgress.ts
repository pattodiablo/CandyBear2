export const BOUGHT_MOMENT_CARDS_STORAGE_KEY = "candybear2-bought-moment-cards";

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
}