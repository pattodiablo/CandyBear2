import type { ProductSlotId } from "./productProgress";
import type { WorkstationId } from "./workstationProgress";

export type UnlockId = Exclude<ProductSlotId, "holder1"> | WorkstationId;

export interface UnlockCatalogEntry {
	id: UnlockId;
	displayName: string;
	previewTextureKey: string;
	previewFrame?: string | number;
	coinCost: number;
}

// Levels 1-20 average ~207 clients; at ~3 coins each that is ~621 coins available.
// Total unlock cost is intentionally below that budget so everything can be bought by level 20.
export const UNLOCK_CATALOG: Record<UnlockId, UnlockCatalogEntry> = {
	holder2: {
		id: "holder2",
		displayName: "Berry Dip",
		previewTextureKey: "Product2Raw",
		coinCost: 35,
	},
	fryer2: {
		id: "fryer2",
		displayName: "Second Fryer",
		previewTextureKey: "Fryer",
		coinCost: 45,
	},
	toaster: {
		id: "toaster",
		displayName: "Toaster",
		previewTextureKey: "toaster",
		coinCost: 55,
	},
	milkmachine: {
		id: "milkmachine",
		displayName: "Milk Machine",
		previewTextureKey: "Milkmachine",
		coinCost: 70,
	},
	workplace2: {
		id: "workplace2",
		displayName: "Second Workplace",
		previewTextureKey: "workplace",
		coinCost: 85,
	},
	holder3: {
		id: "holder3",
		displayName: "Milk Glass",
		previewTextureKey: "GlassAnim",
		previewFrame: "Vaso0001.png",
		coinCost: 95,
	},
	holder4: {
		id: "holder4",
		displayName: "Sandwich",
		previewTextureKey: "sandWichAnim",
		previewFrame: "sandwich0001.png",
		coinCost: 105,
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

export function isProductUnlockId(unlockId: UnlockId): unlockId is Exclude<ProductSlotId, "holder1"> {
	return unlockId === "holder2" || unlockId === "holder3" || unlockId === "holder4";
}