export type ProductSlotId = "holder1" | "holder2" | "holder3" | "holder4";

export const PRODUCT_SLOT_ORDER: ProductSlotId[] = [
	"holder1",
	"holder2",
	"holder3",
	"holder4",
];

export const ACQUIRED_PRODUCTS_STORAGE_KEY = "candybear2-acquired-products";
export const UNLOCKED_HOLDER_TEXTURE_KEY = "Holder";

const LOCKED_TEXTURE_BY_SLOT: Record<ProductSlotId, string> = {
	holder1: "product1Locked",
	holder2: "product2Locked",
	holder3: "product4Locked",
	holder4: "product3Locked",
};

const DEFAULT_ACQUIRED_PRODUCTS: ProductSlotId[] = ["holder1"];

const PRODUCT_COIN_REWARD_BY_SLOT: Record<ProductSlotId, number> = {
	holder1: 2,
	holder2: 3,
	holder3: 4,
	holder4: 3,
};

function normalizeAcquiredProducts(value: unknown): ProductSlotId[] {
	if (!Array.isArray(value)) {
		return [...DEFAULT_ACQUIRED_PRODUCTS];
	}

	const acquiredProducts = value.filter((slotId): slotId is ProductSlotId => (
		typeof slotId === "string" && PRODUCT_SLOT_ORDER.includes(slotId as ProductSlotId)
	));

	return acquiredProducts.length > 0 ? acquiredProducts : [...DEFAULT_ACQUIRED_PRODUCTS];
}

function readAcquiredProductsRecord(): ProductSlotId[] {
	if (typeof window === "undefined") {
		return [...DEFAULT_ACQUIRED_PRODUCTS];
	}

	try {
		const storedValue = window.localStorage.getItem(ACQUIRED_PRODUCTS_STORAGE_KEY);
		if (!storedValue) {
			return [...DEFAULT_ACQUIRED_PRODUCTS];
		}

		return normalizeAcquiredProducts(JSON.parse(storedValue));
	} catch {
		return [...DEFAULT_ACQUIRED_PRODUCTS];
	}
}

export function getLockedTextureKey(slotId: ProductSlotId) {
	return LOCKED_TEXTURE_BY_SLOT[slotId];
}

export function getProductCoinReward(slotId: ProductSlotId) {
	return PRODUCT_COIN_REWARD_BY_SLOT[slotId];
}

export function getAcquiredProductSlots() {
	return [...new Set(readAcquiredProductsRecord())];
}

export function isProductAcquired(slotId: ProductSlotId) {
	return getAcquiredProductSlots().includes(slotId);
}

export function storeProductAcquired(slotId: ProductSlotId) {
	if (typeof window === "undefined") {
		return;
	}

	const acquiredProducts = new Set(getAcquiredProductSlots());
	acquiredProducts.add(slotId);
	window.localStorage.setItem(
		ACQUIRED_PRODUCTS_STORAGE_KEY,
		JSON.stringify(PRODUCT_SLOT_ORDER.filter((productSlot) => acquiredProducts.has(productSlot)))
	);
}

export function clearAcquiredProducts() {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.removeItem(ACQUIRED_PRODUCTS_STORAGE_KEY);
}