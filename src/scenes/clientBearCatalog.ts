import Phaser from "phaser";

/** body default (0) + bodySkin1..bodySkin15 */
export const BODY_SKIN_MAX_INDEX = 15;

/** El último skin (bodySkin15) se desbloquea en este nivel. */
export const LAST_BODY_SKIN_UNLOCK_LEVEL = 30;

/**
 * Nombre de cada osito según el head/skin.
 * 0 = head (default), 1 = headSkin1, … 15 = headSkin15
 */
export const CLIENT_BEAR_NAMES = [
	"Pepe",   // head
	"Lulu",   // headSkin1
	"Carl",   // headSkin2
	"Fubu",   // headSkin3
	"Mock",   // headSkin4
	"Gommy",  // headSkin5
	"Sussy",  // headSkin6
	"Falck",  // headSkin7
	"Shef",   // headSkin8
	"Muly",   // headSkin9
	"Spock",  // headSkin10
	"Darky",  // headSkin11
	"Fran",   // headSkin12
	"Fuse",   // headSkin13
	"Rut",    // headSkin14
	"Som",    // headSkin15
] as const;

/** Frase de cada osito (mismo orden que CLIENT_BEAR_NAMES / head skins). */
export const CLIENT_BEAR_QUOTES = [
	"Just bear-y perfect!",   // Pepe
	"Absolutely fabulous!",   // Lulu
	"Champion flavor!",       // Carl
	"Wise choice!",           // Fubu
	"Don't touch my donut!",  // Mock
	"Yummy in my tummy!",     // Gommy
	"Sweetness overload!",    // Sussy
	"Too cool for glaze!",    // Falck
	"Baked with love!",       // Shef
	"Ready, set, eat!",       // Muly
	"Dreamy donuts!",         // Spock
	"Devilishly delicious!",  // Darky
	"Built to perfection!",   // Fran
	"Magic in every bite!",   // Fuse
	"Sweet & stylish!",       // Rut
	"Simple but delicious!",  // Som
] as const;

export function getClientBearName(skinIndex: number) {
	const normalizedIndex = Phaser.Math.Clamp(Math.floor(skinIndex), 0, BODY_SKIN_MAX_INDEX);
	return CLIENT_BEAR_NAMES[normalizedIndex] ?? CLIENT_BEAR_NAMES[0];
}

export function getClientBearQuote(skinIndex: number) {
	const normalizedIndex = Phaser.Math.Clamp(Math.floor(skinIndex), 0, BODY_SKIN_MAX_INDEX);
	const quote = CLIENT_BEAR_QUOTES[normalizedIndex] ?? CLIENT_BEAR_QUOTES[0];
	return `'${quote}'`;
}

export interface ClientBearPersonality {
	label: string;
	speed: "Muy Lenta" | "Lenta" | "Normal" | "Rápida" | "Muy Rápida";
	patience: "Muy Alta" | "Alta" | "Media" | "Normal" | "Baja" | "Crítica" | "Muy Baja";
	payout: "Pago Bajo" | "Pago Base" | "Propina Alta" | "Propina Máxima" | "Normal";
	maxOrderCount: number;
	likeBias: "Nunca" | "Raro" | "Normal" | "Doble" | "Siempre";
	successDialogue: string;
	failureDialogue: string;
	baseTipChanceBonus: number;
	tipPayoutMultiplier: number;
}

export interface ClientBearProfile {
	skinIndex: number;
	/** Multiplicador del tiempo de espera base (más alto = más paciente). */
	waitMultiplier: number;
	/** Probabilidad de dar like al completar el pedido con éxito (0–1). */
	likeChance: number;
	/**
	 * Si es true, el "secreto" para obtener like es darles una galleta
	 * de la cookie jar (además de completar el pedido).
	 */
	requiresCookieForLike: boolean;
	maxOrderCount: number;
	baseTipChanceBonus: number;
	tipPayoutMultiplier: number;
	successDialogue: string;
	failureDialogue: string;
	personalityLabel: string;
}

const CLIENT_BEAR_PERSONALITIES: Record<number, ClientBearPersonality> = {
	0: {
		label: "Gommy / Pepe (Estándar)",
		speed: "Normal",
		patience: "Normal",
		payout: "Pago Base",
		maxOrderCount: 2,
		likeBias: "Normal",
		successDialogue: "YUM!",
		failureDialogue: "NOP!",
		baseTipChanceBonus: 0.08,
		tipPayoutMultiplier: 1,
	},
	1: {
		label: "Lulu (Coqueta)",
		speed: "Normal",
		patience: "Media",
		payout: "Propina Alta",
		maxOrderCount: 2,
		likeBias: "Doble",
		successDialogue: "YAY!",
		failureDialogue: "UPS!",
		baseTipChanceBonus: 0.22,
		tipPayoutMultiplier: 1.7,
	},
	2: {
		label: "Carl (Estándar)",
		speed: "Normal",
		patience: "Normal",
		payout: "Pago Base",
		maxOrderCount: 1,
		likeBias: "Normal",
		successDialogue: "YUM!",
		failureDialogue: "NOP!",
		baseTipChanceBonus: 0.08,
		tipPayoutMultiplier: 1,
	},
	3: {
		label: "Fubu (Abuelito)",
		speed: "Muy Lenta",
		patience: "Muy Alta",
		payout: "Normal",
		maxOrderCount: 1,
		likeBias: "Siempre",
		successDialogue: "Mmm...",
		failureDialogue: "Aww...",
		baseTipChanceBonus: 0.14,
		tipPayoutMultiplier: 1.25,
	},
	4: {
		label: "Mock (Enojado)",
		speed: "Rápida",
		patience: "Crítica",
		payout: "Pago Base",
		maxOrderCount: 1,
		likeBias: "Nunca",
		successDialogue: "Hmph!",
		failureDialogue: "GRRR!",
		baseTipChanceBonus: 0,
		tipPayoutMultiplier: 1,
	},
	5: {
		label: "Gommy (Estándar)",
		speed: "Normal",
		patience: "Normal",
		payout: "Pago Base",
		maxOrderCount: 2,
		likeBias: "Normal",
		successDialogue: "YUM!",
		failureDialogue: "NOP!",
		baseTipChanceBonus: 0.08,
		tipPayoutMultiplier: 1,
	},
	6: {
		label: "Sussy (Estándar)",
		speed: "Normal",
		patience: "Normal",
		payout: "Pago Base",
		maxOrderCount: 1,
		likeBias: "Normal",
		successDialogue: "YUM!",
		failureDialogue: "NOP!",
		baseTipChanceBonus: 0.08,
		tipPayoutMultiplier: 1,
	},
	7: {
		label: "Falck (Bad Boy)",
		speed: "Rápida",
		patience: "Media",
		payout: "Propina Alta",
		maxOrderCount: 1,
		likeBias: "Normal",
		successDialogue: "COOL!",
		failureDialogue: "MEH!",
		baseTipChanceBonus: 0.2,
		tipPayoutMultiplier: 1.6,
	},
	8: {
		label: "Shef (Chef)",
		speed: "Normal",
		patience: "Media",
		payout: "Propina Máxima",
		maxOrderCount: 3,
		likeBias: "Doble",
		successDialogue: "BRAVO!",
		failureDialogue: "PUAJ!",
		baseTipChanceBonus: 0.28,
		tipPayoutMultiplier: 2,
	},
	9: {
		label: "Muly (Estándar)",
		speed: "Normal",
		patience: "Normal",
		payout: "Pago Base",
		maxOrderCount: 1,
		likeBias: "Normal",
		successDialogue: "YUM!",
		failureDialogue: "NOP!",
		baseTipChanceBonus: 0.08,
		tipPayoutMultiplier: 1,
	},
	10: {
		label: "Spock (Zen)",
		speed: "Lenta",
		patience: "Alta",
		payout: "Pago Base",
		maxOrderCount: 1,
		likeBias: "Normal",
		successDialogue: "OMMM...",
		failureDialogue: "UFF...",
		baseTipChanceBonus: 0.06,
		tipPayoutMultiplier: 1,
	},
	11: {
		label: "Darky (Diablito)",
		speed: "Muy Rápida",
		patience: "Baja",
		payout: "Pago Bajo",
		maxOrderCount: 2,
		likeBias: "Raro",
		successDialogue: "MUAJA!",
		failureDialogue: "OUCH!",
		baseTipChanceBonus: 0.02,
		tipPayoutMultiplier: 0.9,
	},
	12: {
		label: "Fran (Constructor)",
		speed: "Normal",
		patience: "Muy Baja",
		payout: "Propina Alta",
		maxOrderCount: 3,
		likeBias: "Raro",
		successDialogue: "YEAH!",
		failureDialogue: "BAH!",
		baseTipChanceBonus: 0.24,
		tipPayoutMultiplier: 1.8,
	},
	13: {
		label: "Fuse (Mago)",
		speed: "Lenta",
		patience: "Alta",
		payout: "Propina Alta",
		maxOrderCount: 2,
		likeBias: "Normal",
		successDialogue: "TADA!",
		failureDialogue: "BOOM!",
		baseTipChanceBonus: 0.24,
		tipPayoutMultiplier: 1.8,
	},
	14: {
		label: "Rut (Coqueta)",
		speed: "Normal",
		patience: "Media",
		payout: "Propina Alta",
		maxOrderCount: 2,
		likeBias: "Doble",
		successDialogue: "YAY!",
		failureDialogue: "UPS!",
		baseTipChanceBonus: 0.22,
		tipPayoutMultiplier: 1.7,
	},
	15: {
		label: "Som (Estándar)",
		speed: "Normal",
		patience: "Normal",
		payout: "Pago Base",
		maxOrderCount: 1,
		likeBias: "Normal",
		successDialogue: "YUM!",
		failureDialogue: "NOP!",
		baseTipChanceBonus: 0.08,
		tipPayoutMultiplier: 1,
	},
};

export function getClientBearPersonality(skinIndex: number): ClientBearPersonality {
	const normalizedIndex = Phaser.Math.Clamp(Math.floor(skinIndex), 0, BODY_SKIN_MAX_INDEX);
	return CLIENT_BEAR_PERSONALITIES[normalizedIndex] ?? CLIENT_BEAR_PERSONALITIES[0];
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

/**
 * Índice máximo de skin desbloqueado para el jugador.
 * Se ignora el progreso por nivel; las apariencias de clientes solo aparecen si
 * el jugador ya ha comprado ese skin en el sistema de unlocks.
 */
export function getMaxUnlockedBodySkinIndex(levelNumber: number) {
	const acquiredSkinIndexes = new Set<number>([0]);

	if (typeof window !== "undefined") {
		try {
			const storedValue = window.localStorage.getItem("candybear2-acquired-client-unlocks");
			if (storedValue) {
				const parsed = JSON.parse(storedValue);
				if (Array.isArray(parsed)) {
					for (const unlockId of parsed) {
						if (typeof unlockId === "string" && unlockId.startsWith("clientSkin")) {
							const skinIndex = Number.parseInt(unlockId.replace("clientSkin", ""), 10);
							if (!Number.isNaN(skinIndex)) {
								acquiredSkinIndexes.add(skinIndex);
							}
						}
					}
				}
			}
		} catch {
			// Si no hay estado persistido, se mantiene solo el skin por defecto.
		}
	}

	return Math.max(...acquiredSkinIndexes, 0);
}

/**
 * Perfil de paciencia y likes según el skin.
 * Skins bajos: más wait y más chance de like.
 * Skins altos: menos wait y menos chance de like.
 * Algunos ositos (más a menudo los altos) exigen galleta para dar like.
 */
export function getClientBearProfile(skinIndex: number): ClientBearProfile {
	const normalizedIndex = Phaser.Math.Clamp(Math.floor(skinIndex), 0, BODY_SKIN_MAX_INDEX);
	const personality = getClientBearPersonality(normalizedIndex);
	const progress = normalizedIndex / BODY_SKIN_MAX_INDEX;
	const cookieSecretChance = Phaser.Math.Linear(0.18, 0.45, progress);

	const likeChanceMap: Record<ClientBearPersonality["likeBias"], number> = {
		"Nunca": 0,
		"Raro": 0.18,
		"Normal": 0.48,
		"Doble": 0.7,
		"Siempre": 1,
	};

	const waitMultiplierMap: Record<ClientBearPersonality["speed"], number> = {
		"Muy Lenta": 1.5,
		"Lenta": 1.28,
		"Normal": 1,
		"Rápida": 0.8,
		"Muy Rápida": 0.62,
	};

	const patienceBias = {
		"Muy Alta": 1.2,
		"Alta": 1.1,
		"Media": 1,
		"Normal": 1,
		"Baja": 0.85,
		"Crítica": 0.7,
		"Muy Baja": 0.6,
	} as const;

	const baseWaitMultiplier = waitMultiplierMap[personality.speed] ?? 1;
	const patienceMultiplier = patienceBias[personality.patience as keyof typeof patienceBias] ?? 1;
	const likeChance = likeChanceMap[personality.likeBias] ?? 0.48;

	return {
		skinIndex: normalizedIndex,
		waitMultiplier: Number((baseWaitMultiplier * patienceMultiplier).toFixed(3)),
		likeChance: Number(Math.min(1, Math.max(0, likeChance)).toFixed(3)),
		requiresCookieForLike: Math.random() < cookieSecretChance,
		maxOrderCount: personality.maxOrderCount,
		baseTipChanceBonus: personality.baseTipChanceBonus,
		tipPayoutMultiplier: personality.tipPayoutMultiplier,
		successDialogue: personality.successDialogue,
		failureDialogue: personality.failureDialogue,
		personalityLabel: personality.label,
	};
}

/**
 * Elige un skin entre los desbloqueados.
 * A mayor dificultad, sesga un poco hacia skins más altos (más exigentes).
 */
export function pickClientBearSkinIndex(levelNumber: number, difficulty: number) {
	const acquiredSkinIndexes = new Set<number>([0]);

	if (typeof window !== "undefined") {
		try {
			const storedValue = window.localStorage.getItem("candybear2-acquired-client-unlocks");
			if (storedValue) {
				const parsed = JSON.parse(storedValue);
				if (Array.isArray(parsed)) {
					for (const unlockId of parsed) {
						if (typeof unlockId === "string" && unlockId.startsWith("clientSkin")) {
							const skinIndex = Number.parseInt(unlockId.replace("clientSkin", ""), 10);
							if (!Number.isNaN(skinIndex)) {
								acquiredSkinIndexes.add(skinIndex);
							}
						}
					}
				}
			}
		} catch {
			// Mantener el skin por defecto si no hay estado persistido.
		}
	}

	const unlockedIndexes = [...acquiredSkinIndexes].sort((left, right) => left - right);
	if (unlockedIndexes.length <= 1) {
		return 0;
	}

	const difficultyBias = Phaser.Math.Clamp(difficulty, 0.5, 3);
	const weights: number[] = [];

	for (const skinIndex of unlockedIndexes) {
		const progress = skinIndex / (unlockedIndexes[unlockedIndexes.length - 1] || 1);
		weights.push(1 + progress * (difficultyBias - 0.5));
	}

	const chosenIndex = pickWeightedIndex(weights);
	return unlockedIndexes[chosenIndex] ?? 0;
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
