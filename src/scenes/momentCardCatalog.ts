import { getTotalLikes } from "./likeProgress";
import { getStoredTotalCoins } from "./levelProgress";
import { isMomentCardBought } from "./momentProgress";

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

/**
 * Líneas de upgrade consecutivas (I → II → III).
 * Cada nivel superior requiere haber comprado el anterior de la misma línea.
 */
export const MOMENT_UPGRADE_LINES: readonly (readonly number[])[] = [
	[1, 2, 3],
	[4, 5, 6],
	[7, 8, 9],
	[10, 11, 12],
	[13, 14, 15],
] as const;

/** Costos de upgrades: piso de 10 monedas y ~5 likes; sube por página. */
const MOMENT_CARD_PAGE_COSTS: ReadonlyArray<{
	coinCosts: readonly [number, number, number, number, number];
	likeCosts: readonly [number, number, number, number, number];
}> = [
	{ coinCosts: [10, 13, 16, 19, 22], likeCosts: [5, 5, 6, 6, 7] },
	{ coinCosts: [25, 28, 32, 36, 40], likeCosts: [8, 9, 9, 10, 11] },
	{ coinCosts: [45, 50, 55, 60, 65], likeCosts: [12, 13, 14, 15, 16] },
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

/** Card number del nivel previo en la misma línea, o null si es el nivel I. */
export function getMomentCardPrerequisite(cardNumber: number): number | null {
	const normalizedCardNumber = Math.max(1, Math.floor(cardNumber));

	for (const line of MOMENT_UPGRADE_LINES) {
		const tierIndex = line.indexOf(normalizedCardNumber);

		if (tierIndex < 0) {
			continue;
		}

		return tierIndex === 0 ? null : line[tierIndex - 1];
	}

	return null;
}

export function isMomentCardPrerequisiteMet(cardNumber: number) {
	const prerequisite = getMomentCardPrerequisite(cardNumber);

	if (prerequisite === null) {
		return true;
	}

	return isMomentCardBought(prerequisite);
}

export function canPurchaseMomentCard(
	cardNumber: number,
	totalCoins = getStoredTotalCoins(),
	totalLikes = getTotalLikes(),
) {
	if (isMomentCardBought(cardNumber) || !isMomentCardPrerequisiteMet(cardNumber)) {
		return false;
	}

	const entry = getMomentCardCatalogEntry(cardNumber);
	return totalCoins >= entry.coinCost && totalLikes >= entry.likeCost;
}

export function canAffordAnyMomentCard(
	totalCoins = getStoredTotalCoins(),
	totalLikes = getTotalLikes(),
) {
	return MOMENT_CARD_CATALOG.some((entry) => (
		canPurchaseMomentCard(entry.cardNumber, totalCoins, totalLikes)
	));
}