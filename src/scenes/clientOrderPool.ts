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
		.filter(isClientRequestAvailable)
		.map(({ appearance }) => appearance);

	return availableRequests.length > 0 ? availableRequests : [...DEFAULT_CLIENT_REQUESTS];
}