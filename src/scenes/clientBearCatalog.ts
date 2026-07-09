import Phaser from "phaser";

/** body default (0) + bodySkin1..bodySkin15 */
export const BODY_SKIN_MAX_INDEX = 15;

/** El último skin (bodySkin15) se desbloquea en este nivel. */
export const LAST_BODY_SKIN_UNLOCK_LEVEL = 30;

export interface ClientBearProfile {
	skinIndex: number;
	/** Multiplicador del tiempo de espera base (más alto = más paciente). */
	waitMultiplier: number;
	/** Probabilidad de dar like al completar el pedido con éxito (0–1). */
	likeChance: number;
}

/**
 * Nivel mínimo en el que puede aparecer un skin.
 * skin 0 (body default) → nivel 1
 * bodySkin1 → ~2, bodySkin2 → ~4, … bodySkin15 → 30
 */
export function getBodySkinUnlockLevel(skinIndex: number) {
	const normalizedIndex = Phaser.Math.Clamp(Math.floor(skinIndex), 0, BODY_SKIN_MAX_INDEX);

	if (normalizedIndex <= 0) {
		return 1;
	}

	return Math.max(
		1,
		Math.round((normalizedIndex / BODY_SKIN_MAX_INDEX) * LAST_BODY_SKIN_UNLOCK_LEVEL)
	);
}

/** Índice máximo de skin desbloqueado para un nivel de campaña. */
export function getMaxUnlockedBodySkinIndex(levelNumber: number) {
	const normalizedLevel = Math.max(1, Math.floor(levelNumber));
	let maxUnlocked = 0;

	for (let skinIndex = 0; skinIndex <= BODY_SKIN_MAX_INDEX; skinIndex++) {
		if (getBodySkinUnlockLevel(skinIndex) <= normalizedLevel) {
			maxUnlocked = skinIndex;
		}
	}

	return maxUnlocked;
}

/**
 * Perfil de paciencia y likes según el skin.
 * Skins bajos: más wait y más chance de like.
 * Skins altos: menos wait y menos chance de like.
 */
export function getClientBearProfile(skinIndex: number): ClientBearProfile {
	const normalizedIndex = Phaser.Math.Clamp(Math.floor(skinIndex), 0, BODY_SKIN_MAX_INDEX);
	const progress = normalizedIndex / BODY_SKIN_MAX_INDEX;

	return {
		skinIndex: normalizedIndex,
		// ~1.35x (fácil) → ~0.60x (exigente)
		waitMultiplier: Number(Phaser.Math.Linear(1.35, 0.6, progress).toFixed(3)),
		// ~80% → ~10%
		likeChance: Number(Phaser.Math.Linear(0.8, 0.1, progress).toFixed(3)),
	};
}

/**
 * Elige un skin entre los desbloqueados.
 * A mayor dificultad, sesga un poco hacia skins más altos (más exigentes).
 */
export function pickClientBearSkinIndex(levelNumber: number, difficulty: number) {
	const maxUnlocked = getMaxUnlockedBodySkinIndex(levelNumber);

	if (maxUnlocked <= 0) {
		return 0;
	}

	const difficultyBias = Phaser.Math.Clamp(difficulty, 0.5, 3);
	const weights: number[] = [];

	for (let skinIndex = 0; skinIndex <= maxUnlocked; skinIndex++) {
		const progress = skinIndex / maxUnlocked;
		// Peso base 1; skins altos ganan peso con la dificultad.
		weights.push(1 + progress * (difficultyBias - 0.5));
	}

	return pickWeightedIndex(weights);
}

function pickWeightedIndex(weights: number[]) {
	const totalWeight = weights.reduce((sum, weight) => sum + Math.max(0, weight), 0);

	if (totalWeight <= 0) {
		return 0;
	}

	let roll = Math.random() * totalWeight;

	for (let index = 0; index < weights.length; index++) {
		roll -= Math.max(0, weights[index]);

		if (roll <= 0) {
			return index;
		}
	}

	return weights.length - 1;
}
