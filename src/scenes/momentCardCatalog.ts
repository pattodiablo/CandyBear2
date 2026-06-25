export interface MomentCardUpgradeDefinition {
	name: string;
	effect: string;
	unlockLevel: number;
	costTier: "Bajo" | "Medio" | "Alto";
}

export interface MomentCardCatalogEntry {
	cardNumber: number;
	coinCost: number;
	likeCost: number;
	reversoTextureKey: string;
	upgradeName: string;
	upgrade: MomentCardUpgradeDefinition;
}

const MOMENT_CARD_UPGRADES: readonly MomentCardUpgradeDefinition[] = [
	{ name: "Freidora Veloz I", effect: "Velocidad de freído +1", unlockLevel: 3, costTier: "Bajo" },
	{ name: "Freidora Veloz II", effect: "Velocidad de freído +2", unlockLevel: 8, costTier: "Medio" },
	{ name: "Freidora Veloz III", effect: "Velocidad de freído +3", unlockLevel: 15, costTier: "Alto" },
	{ name: "Refill de Leche I", effect: "Velocidad de refill de leches +1", unlockLevel: 4, costTier: "Bajo" },
	{ name: "Refill de Leche II", effect: "Velocidad de refill de leches +2", unlockLevel: 10, costTier: "Medio" },
	{ name: "Refill de Leche III", effect: "Velocidad de refill de leches +3", unlockLevel: 18, costTier: "Alto" },
	{ name: "Sanduchera Rápida I", effect: "Velocidad de sanduchera +1", unlockLevel: 6, costTier: "Bajo" },
	{ name: "Sanduchera Rápida II", effect: "Velocidad de sanduchera +2", unlockLevel: 12, costTier: "Medio" },
	{ name: "Sanduchera Rápida III", effect: "Velocidad de sanduchera +3", unlockLevel: 20, costTier: "Alto" },
	{ name: "Galletas Extra I", effect: "+1 galleta disponible", unlockLevel: 5, costTier: "Bajo" },
	{ name: "Galletas Extra II", effect: "+2 galletas disponibles", unlockLevel: 11, costTier: "Medio" },
	{ name: "Galletas Extra III", effect: "+3 galletas disponibles", unlockLevel: 17, costTier: "Alto" },
	{ name: "Clientes Pacientes I", effect: "Tiempo de espera de clientes +1 (más tiempo)", unlockLevel: 7, costTier: "Bajo" },
	{ name: "Clientes Pacientes II", effect: "Tiempo de espera de clientes +2", unlockLevel: 14, costTier: "Medio" },
	{ name: "Clientes Pacientes III", effect: "Tiempo de espera de clientes +3", unlockLevel: 22, costTier: "Alto" },
];

export const TOTAL_MOMENT_CARDS = MOMENT_CARD_UPGRADES.length;
export const MOMENT_CARDS_PER_PAGE = 5;

const MOMENT_CARD_PAGE_COSTS: ReadonlyArray<{
	coinCosts: readonly [number, number, number, number, number];
	likeCosts: readonly [number, number, number, number, number];
}> = [
	{ coinCosts: [5, 8, 10, 12, 15], likeCosts: [0, 1, 1, 2, 2] },
	{ coinCosts: [18, 20, 22, 25, 28], likeCosts: [2, 3, 3, 4, 4] },
	{ coinCosts: [30, 32, 35, 38, 40], likeCosts: [4, 5, 5, 6, 6] },
];

const MOMENT_CARD_CATALOG: MomentCardCatalogEntry[] = MOMENT_CARD_PAGE_COSTS.flatMap((pageCosts, pageIndex) => {
	return pageCosts.coinCosts.map((coinCost, slotIndex) => {
		const cardNumber = (pageIndex * MOMENT_CARDS_PER_PAGE) + slotIndex + 1;
		const upgrade = MOMENT_CARD_UPGRADES[cardNumber - 1];

		return {
			cardNumber,
			coinCost,
			likeCost: pageCosts.likeCosts[slotIndex],
			reversoTextureKey: getMomentCardReversoTextureKey(cardNumber),
			upgradeName: upgrade.name,
			upgrade,
		};
	});
});

export function getMomentCardReversoTextureKey(cardNumber: number) {
	const normalizedCardNumber = Math.min(
		Math.max(1, Math.floor(cardNumber)),
		TOTAL_MOMENT_CARDS
	);

	return `reversoCard${normalizedCardNumber}`;
}

export function getMomentCardCatalogEntry(cardNumber: number) {
	const normalizedCardNumber = Math.min(
		Math.max(1, Math.floor(cardNumber)),
		TOTAL_MOMENT_CARDS
	);

	return MOMENT_CARD_CATALOG[normalizedCardNumber - 1];
}

export function getMomentCardUpgradeName(cardNumber: number) {
	return getMomentCardCatalogEntry(cardNumber).upgradeName;
}

export function getAllMomentCardCatalogEntries() {
	return MOMENT_CARD_CATALOG;
}