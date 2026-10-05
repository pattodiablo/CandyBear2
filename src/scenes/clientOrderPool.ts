import Phaser from "phaser";
import { isProductAcquired, type ProductSlotId } from "./productProgress";
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

/**
 * Un producto/estación es pedible en cuanto está adquirido, sin volver a chequear el
 * unlockLevel del catálogo: ese nivel solo rige cuándo algo se vuelve COMPRABLE en la
 * tienda, no si un producto ya adquirido (por compra o por un auto-unlock temprano,
 * como la leche desde el día 3) puede pedirse. Antes esto nunca generaba discrepancia
 * porque no existía forma de adquirir algo antes de su unlockLevel; el auto-unlock
 * temprano la introdujo, y este chequeo extra dejaba la leche "desbloqueada" en la
 * cocina pero invisible para el generador de pedidos hasta el día 6.
 */
function isClientRequestAvailable({ productSlot, workstation }: ClientRequestDefinition) {
	if (productSlot && !isProductAcquired(productSlot)) {
		return false;
	}

	if (workstation && !isWorkstationAcquired(workstation)) {
		return false;
	}

	return true;
}

export function getAvailableClientRequests() {
	const availableRequests = CLIENT_REQUEST_DEFINITIONS
		.filter((request) => isClientRequestAvailable(request))
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

export function pickClientOrders(orderCount: number) {
	const requestPool = Phaser.Utils.Array.Shuffle([...getAvailableClientRequests()]);
	const normalizedCount = Math.max(1, Math.floor(orderCount));

	return requestPool.slice(0, Math.min(normalizedCount, requestPool.length));
}