export type WorkstationId = "fryer2" | "milkmachine" | "toaster" | "workplace2";

export const WORKSTATION_ORDER: WorkstationId[] = [
	"fryer2",
	"milkmachine",
	"toaster",
	"workplace2",
];

export const ACQUIRED_WORKSTATIONS_STORAGE_KEY = "candybear2-acquired-workstations";

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

function normalizeAcquiredWorkstations(value: unknown): WorkstationId[] {
	if (!Array.isArray(value)) {
		return [...DEFAULT_ACQUIRED_WORKSTATIONS];
	}

	return value.filter((workstationId): workstationId is WorkstationId => (
		typeof workstationId === "string" && WORKSTATION_ORDER.includes(workstationId as WorkstationId)
	));
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
	return [...new Set(readAcquiredWorkstationsRecord())];
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