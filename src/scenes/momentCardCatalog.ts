export interface MomentCardCatalogEntry {
	cardNumber: number;
	coinCost: number;
	likeCost: number;
	reversoTextureKey: string;
}

const MOMENT_CARD_REVERSO_TEXTURE_COUNT = 15;

const MOMENT_CARD_PAGE_COSTS: ReadonlyArray<{
	coinCosts: readonly [number, number, number, number, number];
	likeCosts: readonly [number, number, number, number, number];
}> = [
	{ coinCosts: [5, 8, 10, 12, 15], likeCosts: [0, 1, 1, 2, 2] },
	{ coinCosts: [18, 20, 22, 25, 28], likeCosts: [2, 3, 3, 4, 4] },
	{ coinCosts: [30, 32, 35, 38, 40], likeCosts: [4, 5, 5, 6, 6] },
	{ coinCosts: [42, 45, 48, 50, 55], likeCosts: [6, 7, 7, 8, 8] },
	{ coinCosts: [58, 60, 65, 68, 72], likeCosts: [8, 9, 10, 10, 11] },
	{ coinCosts: [75, 78, 82, 85, 90], likeCosts: [11, 12, 13, 13, 14] },
	{ coinCosts: [95, 98, 102, 108, 112], likeCosts: [14, 15, 16, 17, 18] },
	{ coinCosts: [118, 125, 132, 140, 150], likeCosts: [18, 20, 22, 24, 25] },
];

const MOMENT_CARD_CATALOG: MomentCardCatalogEntry[] = MOMENT_CARD_PAGE_COSTS.flatMap((pageCosts, pageIndex) => {
	return pageCosts.coinCosts.map((coinCost, slotIndex) => {
		const cardNumber = (pageIndex * 5) + slotIndex + 1;

		return {
			cardNumber,
			coinCost,
			likeCost: pageCosts.likeCosts[slotIndex],
			reversoTextureKey: getMomentCardReversoTextureKey(cardNumber),
		};
	});
});

export const TOTAL_MOMENT_CARDS = MOMENT_CARD_CATALOG.length;

export function getMomentCardReversoTextureKey(cardNumber: number) {
	const normalizedCardNumber = Math.max(1, Math.floor(cardNumber));
	const textureIndex = ((normalizedCardNumber - 1) % MOMENT_CARD_REVERSO_TEXTURE_COUNT) + 1;

	return `reversoCard${textureIndex}`;
}

export function getMomentCardCatalogEntry(cardNumber: number) {
	const normalizedCardNumber = Math.max(1, Math.floor(cardNumber));
	return MOMENT_CARD_CATALOG[normalizedCardNumber - 1];
}

export function getAllMomentCardCatalogEntries() {
	return MOMENT_CARD_CATALOG;
}