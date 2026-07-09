import { MOMENT_UPGRADE_LINES } from "./momentCardCatalog";
import { isMomentCardBought } from "./momentProgress";

const [
	FRYER_SPEED_CARD_NUMBERS,
	MILK_REFILL_CARD_NUMBERS,
	TOASTER_SPEED_CARD_NUMBERS,
	EXTRA_COOKIE_CARD_NUMBERS,
	CLIENT_PATIENCE_CARD_NUMBERS,
] = MOMENT_UPGRADE_LINES;

export const MOMENT_UPGRADE_BONUSES = {
	FRY_MS_REDUCTION_PER_LEVEL: 600,
	FRY_MIN_DURATION_MS: 1200,
	MACHINE_ANIM_SPEED_PER_LEVEL: 0.25,
	COOKIES_PER_DAY_BASE: 5,
	CLIENT_WAIT_BASE_MS: 20000,
	CLIENT_WAIT_BONUS_MS_PER_LEVEL: 4000,
} as const;

/** Solo cuenta tiers consecutivos desde el nivel I (I → II → III). */
function getMaxBoughtTier(cardNumbers: readonly number[]) {
	let maxTier = 0;

	for (let index = 0; index < cardNumbers.length; index++) {
		if (!isMomentCardBought(cardNumbers[index])) {
			break;
		}

		maxTier = index + 1;
	}

	return maxTier;
}

export function getFryerSpeedBonus() {
	return getMaxBoughtTier(FRYER_SPEED_CARD_NUMBERS);
}

export function getMilkRefillSpeedBonus() {
	return getMaxBoughtTier(MILK_REFILL_CARD_NUMBERS);
}

export function getToasterSpeedBonus() {
	return getMaxBoughtTier(TOASTER_SPEED_CARD_NUMBERS);
}

export function getExtraCookiesBonus() {
	return getMaxBoughtTier(EXTRA_COOKIE_CARD_NUMBERS);
}

export function getClientPatienceBonus() {
	return getMaxBoughtTier(CLIENT_PATIENCE_CARD_NUMBERS);
}

export function getCookiesPerDayLimit() {
	return MOMENT_UPGRADE_BONUSES.COOKIES_PER_DAY_BASE + getExtraCookiesBonus();
}

export function getClientRequestWaitDurationMs() {
	return MOMENT_UPGRADE_BONUSES.CLIENT_WAIT_BASE_MS
		+ (getClientPatienceBonus() * MOMENT_UPGRADE_BONUSES.CLIENT_WAIT_BONUS_MS_PER_LEVEL);
}

export function getMachineAnimationTimeScale(speedBonus: number) {
	return 1 + (speedBonus * MOMENT_UPGRADE_BONUSES.MACHINE_ANIM_SPEED_PER_LEVEL);
}

export function getAdjustedFryDurationMs(baseFryDurationMs: number) {
	const reduction = getFryerSpeedBonus() * MOMENT_UPGRADE_BONUSES.FRY_MS_REDUCTION_PER_LEVEL;
	return Math.max(
		MOMENT_UPGRADE_BONUSES.FRY_MIN_DURATION_MS,
		baseFryDurationMs - reduction
	);
}