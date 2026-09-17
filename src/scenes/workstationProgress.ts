export type WorkstationId = "fryer2" | "milkmachine" | "toaster" | "workplace2";

const LEGACY_PRODUCT_STORAGE_KEY = "candybear2-acquired-products";

export const WORKSTATION_ORDER: WorkstationId[] = [
	"fryer2",
	"milkmachine",
	"toaster",
	"workplace2",
];

export const ACQUIRED_WORKSTATIONS_STORAGE_KEY = "candybear2-acquired-workstations";

const LEGACY_WORKSTATION_ID_ALIASES: Record<string, WorkstationId> = {
	workplace: "workplace2",
};

const UNLOCKED_TEXTURE_BY_WORKSTATION: Record<WorkstationId, string> = {
	fryer2: "FryerAnim",
	milkmachine: "Milkmachine",
	toaster: "toasterAnim",
	workplace2: "workplace",
};

const LOCKED_TEXTURE_BY_WORKSTATION: Record<WorkstationId, string> = {
	fryer2: "lockedFryer",
	milkmachine: "lockedMilkMachine",
	toaster: "lockedToaster",
	workplace2: "lockedWorkplace",
};

const DEFAULT_ACQUIRED_WORKSTATIONS: WorkstationId[] = [];

function readLegacyBundledProducts(): Set<string> {
	if (typeof window === "undefined") {
		return new Set<string>();
	}

	try {
		const storedValue = window.localStorage.getItem(LEGACY_PRODUCT_STORAGE_KEY);
		if (!storedValue) {
			return new Set<string>();
		}

		const parsedValue = JSON.parse(storedValue);
		if (!Array.isArray(parsedValue)) {
			return new Set<string>();
		}

		return new Set(
			parsedValue.filter((slotId): slotId is string => (
				typeof slotId === "string" && (slotId === "holder1" || slotId === "holder2" || slotId === "holder3" || slotId === "holder4")
			))
		);
	} catch {
		return new Set<string>();
	}
}

function normalizeAcquiredWorkstations(value: unknown): WorkstationId[] {
	if (!Array.isArray(value)) {
		return [...DEFAULT_ACQUIRED_WORKSTATIONS];
	}

	return [...new Set(
		value
			.map((workstationId) => {
				if (typeof workstationId !== "string") {
					return undefined;
				}

				const canonical = LEGACY_WORKSTATION_ID_ALIASES[workstationId] ?? workstationId;
				return WORKSTATION_ORDER.includes(canonical as WorkstationId)
					? canonical as WorkstationId
					: undefined;
			})
			.filter((workstationId): workstationId is WorkstationId => workstationId !== undefined),
	)];
}

function readAcquiredWorkstationsRecord(): WorkstationId[] {
	if (typeof window === "undefined") {
		return [...DEFAULT_ACQUIRED_WORKSTATIONS];
	}

	try {
		const storedValue = window.localStorage.getItem(ACQUIRED_WORKSTATIONS_STORAGE_KEY);
		if (!storedValue) {
			return [...DEFAULT_ACQUIRED_WORKSTATIONS];
		}

		return normalizeAcquiredWorkstations(JSON.parse(storedValue));
	} catch {
		return [...DEFAULT_ACQUIRED_WORKSTATIONS];
	}
}

export function getWorkstationTextureKey(workstationId: WorkstationId, isAcquired: boolean) {
	return isAcquired
		? UNLOCKED_TEXTURE_BY_WORKSTATION[workstationId]
		: LOCKED_TEXTURE_BY_WORKSTATION[workstationId];
}

export function getAcquiredWorkstations() {
	const acquiredWorkstations = new Set(readAcquiredWorkstationsRecord());
	const bundledProducts = readLegacyBundledProducts();

	if (bundledProducts.has("holder4")) {
		acquiredWorkstations.add("milkmachine");
	}

	if (bundledProducts.has("holder3")) {
		acquiredWorkstations.add("toaster");
	}

	return [...new Set(WORKSTATION_ORDER.filter((workstationId) => acquiredWorkstations.has(workstationId)))];
}

export function isWorkstationAcquired(workstationId: WorkstationId) {
	return getAcquiredWorkstations().includes(workstationId);
}

export function storeWorkstationAcquired(workstationId: WorkstationId) {
	if (typeof window === "undefined") {
		return;
	}

	const acquiredWorkstations = new Set(getAcquiredWorkstations());
	acquiredWorkstations.add(workstationId);
	window.localStorage.setItem(
		ACQUIRED_WORKSTATIONS_STORAGE_KEY,
		JSON.stringify(WORKSTATION_ORDER.filter((workstation) => acquiredWorkstations.has(workstation)))
	);
}

export function clearAcquiredWorkstations() {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.removeItem(ACQUIRED_WORKSTATIONS_STORAGE_KEY);
}