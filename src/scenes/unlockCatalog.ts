import type { ProductSlotId } from "./productProgress";
import type { WorkstationId } from "./workstationProgress";

export type UnlockId = Exclude<ProductSlotId, "holder1"> | WorkstationId;

export interface UnlockCatalogEntry {
	id: UnlockId;
	displayName: string;
	previewTextureKey: string;
	previewFrame?: string | number;
	coinCost: number;
	/** Nivel mínimo de campaña en el que se puede comprar este unlock. */
	unlockLevel: number;
}

/**
 * Product 1 (holder1) se mantiene desbloqueado por defecto.
 * Orden de aparición: Berry Dip → Second Fryer → Toaster/Sandwich → Milk → Workplace.
 * El primer unlock aparece desde el nivel 3.
 */
export const UNLOCK_CATALOG: Record<UnlockId, UnlockCatalogEntry> = {
	holder2: {
		id: "holder2",
		displayName: "Berry Dip",
		previewTextureKey: "Product2Raw",
		coinCost: 4,
		unlockLevel: 3,
	},
	fryer2: {
		id: "fryer2",
		displayName: "Second Fryer",
		previewTextureKey: "Fryer",
		// Freidora un poco más cara que el resto del tramo temprano.
		coinCost: 9,
		unlockLevel: 4,
	},
	toaster: {
		id: "toaster",
		displayName: "Toaster",
		previewTextureKey: "toaster",
		coinCost: 28,
		unlockLevel: 5,
	},
	milkmachine: {
		id: "milkmachine",
		displayName: "Milk Machine",
		previewTextureKey: "Milkmachine",
		coinCost: 35,
		unlockLevel: 6,
	},
	workplace2: {
		id: "workplace2",
		displayName: "Second Workplace",
		previewTextureKey: "workplace",
		coinCost: 40,
		unlockLevel: 7,
	},
	holder3: {
		id: "holder3",
		displayName: "Sandwich",
		previewTextureKey: "sandWichAnim",
		previewFrame: "sandwich0001.png",
		coinCost: 7,
		// Mismo tramo que la tostadora (se desbloquea en paquete).
		unlockLevel: 5,
	},
	holder4: {
		id: "holder4",
		displayName: "Milk Glass",
		previewTextureKey: "GlassAnim",
		previewFrame: "Vaso0001.png",
		coinCost: 6,
		// Mismo tramo que la milk machine (se desbloquea en paquete).
		unlockLevel: 6,
	},
};

export const UNLOCK_ORDER: UnlockId[] = [
	"holder2",
	"fryer2",
	"toaster",
	"milkmachine",
	"workplace2",
	"holder3",
	"holder4",
];

export function getUnlockCatalogEntry(unlockId: UnlockId) {
	return UNLOCK_CATALOG[unlockId];
}

export function getTotalUnlockCost() {
	return UNLOCK_ORDER.reduce((total, unlockId) => total + UNLOCK_CATALOG[unlockId].coinCost, 0);
}

export function isUnlockAvailableAtLevel(unlockId: UnlockId, levelNumber: number) {
	const normalizedLevel = Math.max(1, Math.floor(levelNumber));
	return normalizedLevel >= UNLOCK_CATALOG[unlockId].unlockLevel;
}

export function isProductUnlockId(unlockId: UnlockId): unlockId is Exclude<ProductSlotId, "holder1"> {
	return unlockId === "holder2" || unlockId === "holder3" || unlockId === "holder4";
}

const PRODUCT_BUNDLED_WORKSTATIONS: Partial<Record<Exclude<ProductSlotId, "holder1">, WorkstationId>> = {
	holder3: "toaster",
	holder4: "milkmachine",
};

export function getBundledWorkstationsForProductUnlock(
	productSlotId: Exclude<ProductSlotId, "holder1">,
): WorkstationId[] {
	const workstationId = PRODUCT_BUNDLED_WORKSTATIONS[productSlotId];
	return workstationId ? [workstationId] : [];
}

const WORKSTATIONS_UNLOCKED_WITH_PRODUCT = new Set<WorkstationId>(
	Object.values(PRODUCT_BUNDLED_WORKSTATIONS).filter(
		(workstationId): workstationId is WorkstationId => workstationId !== undefined,
	),
);

export function shouldShowWorkstationLockIcon(workstationId: WorkstationId) {
	return !WORKSTATIONS_UNLOCKED_WITH_PRODUCT.has(workstationId);
}
