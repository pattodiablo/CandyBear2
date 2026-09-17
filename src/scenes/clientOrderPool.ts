import Phaser from "phaser";
import { isProductAcquired, type ProductSlotId } from "./productProgress";
import { isUnlockAvailableAtLevel } from "./unlockCatalog";
import { isWorkstationAcquired, type WorkstationId } from "./workstationProgress";

export type ClientRequestAppearance = { key: string; frame?: string | number };

interface ClientRequestDefinition {
	appearance: ClientRequestAppearance;
	productSlot?: ProductSlotId;
	workstation?: WorkstationId;
}

const CLIENT_REQUEST_DEFINITIONS: ClientRequestDefinition[] = [
	{
		appearance: { key: "Product1Chocolate" },
		productSlot: "holder1",
	},
	{
		appearance: { key: "Product1Candy" },
		productSlot: "holder1",
	},
	{
		appearance: { key: "Product2Chocolate" },
		productSlot: "holder2",
	},
	{
		appearance: { key: "Product2Candy" },
		productSlot: "holder2",
	},
	{
		appearance: { key: "sandWichAnim", frame: "sandwich0005.png" },
		productSlot: "holder3",
		workstation: "toaster",
	},
	{
		appearance: { key: "GlassAnim", frame: "Vaso0089.png" },
		productSlot: "holder4",
		workstation: "milkmachine",
	},
	{
		appearance: { key: "GreenGlass" },
		productSlot: "holder4",
		workstation: "milkmachine",
	},
	{
		appearance: { key: "RedGlass" },
		productSlot: "holder4",
		workstation: "milkmachine",
	},
];

const DEFAULT_CLIENT_REQUESTS: ClientRequestAppearance[] = [
	{ key: "Product1Chocolate" },
	{ key: "Product1Candy" },
];

function isClientRequestAvailable(
	{ productSlot, workstation }: ClientRequestDefinition,
	levelNumber?: number,
) {
	if (productSlot) {
		if (!isProductAcquired(productSlot)) {
			return false;
		}

		if (productSlot !== "holder1" && levelNumber !== undefined && !isUnlockAvailableAtLevel(productSlot, levelNumber)) {
			return false;
		}
	}

	if (workstation) {
		if (!isWorkstationAcquired(workstation)) {
			return false;
		}

		if (levelNumber !== undefined && !isUnlockAvailableAtLevel(workstation, levelNumber)) {
			return false;
		}
	}

	return true;
}

export function getAvailableClientRequests(levelNumber?: number) {
	const availableRequests = CLIENT_REQUEST_DEFINITIONS
		.filter((request) => isClientRequestAvailable(request, levelNumber))
		.map(({ appearance }) => appearance);

	return availableRequests.length > 0 ? availableRequests : [...DEFAULT_CLIENT_REQUESTS];
}

export function rollClientOrderCount(levelNumber: number, difficulty: number) {
	const normalizedLevel = Math.max(1, Math.floor(levelNumber));

	if (normalizedLevel <= 10) {
		return 1;
	}

	if (normalizedLevel <= 17) {
		return 2;
	}

	const thirdOrderChance = Phaser.Math.Clamp(
		0.2 + ((normalizedLevel - 18) * 0.03) + ((difficulty - 1) * 0.12),
		0.2,
		0.72
	);

	return Math.random() < thirdOrderChance ? 3 : 2;
}

export function pickClientOrders(orderCount: number, levelNumber?: number) {
	const requestPool = Phaser.Utils.Array.Shuffle([...getAvailableClientRequests(levelNumber)]);
	const normalizedCount = Math.max(1, Math.floor(orderCount));

	return requestPool.slice(0, Math.min(normalizedCount, requestPool.length));
}