import { isMomentCardBought } from "./momentProgress";

const FRYER_SPEED_CARD_NUMBERS = [1, 2, 3] as const;
const MILK_REFILL_CARD_NUMBERS = [4, 5, 6] as const;
const TOASTER_SPEED_CARD_NUMBERS = [7, 8, 9] as const;
const EXTRA_COOKIE_CARD_NUMBERS = [10, 11, 12] as const;
const CLIENT_PATIENCE_CARD_NUMBERS = [13, 14, 15] as const;

export const MOMENT_UPGRADE_BONUSES = {
	FRY_MS_REDUCTION_PER_LEVEL: 600,
	FRY_MIN_DURATION_MS: 1200,
	MACHINE_ANIM_SPEED_PER_LEVEL: 0.25,
	COOKIES_PER_DAY_BASE: 5,
	CLIENT_WAIT_BASE_MS: 20000,
	CLIENT_WAIT_BONUS_MS_PER_LEVEL: 4000,
} as const;

function getMaxBoughtTier(cardNumbers: readonly number[]) {
	let maxTier = 0;

	cardNumbers.forEach((cardNumber, index) => {
		if (isMomentCardBought(cardNumber)) {
			maxTier = Math.max(maxTier, index + 1);
		}
	});

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