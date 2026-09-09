export type GameLanguage = "en" | "es";

type TranslationKey =
	| "prepare"
	| "perfect"
	| "lastCall"
	| "day"
	| "wave"
	| "left"
	| "thanksForPlaying"
	| "likesGiven"
	| "nowAvailable"
	| "infiniteMode"
	| "newBadge"
	| "upgradesAvailable"
	| "buyUpgrades"
	| "newUnlock"
	| "selectNewUpgrade"
	| "areYouSureToExit"
	| "yes"
	| "no"
	| "newUpgradesAwait"
	| "play"
	| "upgrades"
	| "dayShort"
	| "earningsToday"
	| "buy"
	| "coins";

const STRINGS: Record<GameLanguage, Record<TranslationKey, string>> = {
	en: {
		prepare: "Clients coming",
		perfect: "Perfect",
		lastCall: "Last Call! Everything Must Go",
		day: "Day",
		wave: "Wave",
		left: "Left",
		thanksForPlaying: "Thanks for playing",
		likesGiven: "likes given",
		nowAvailable: "now available",
		infiniteMode: "Infinite mode",
		newBadge: "NEW",
		upgradesAvailable: "Upgrades available",
		buyUpgrades: "Buy upgrades",
		newUnlock: "New Unlock",
		selectNewUpgrade: "SELECT NEW UPGRADE",
		areYouSureToExit: "Are you sure\nto exit?",
		yes: "Yes",
		no: "No",
		newUpgradesAwait: "New upgrades await in the\nmain menu!",
		play: "Play",
		upgrades: "Upgrades",
		dayShort: "DAY",
		earningsToday: "Earnings today",
		buy: "BUY",
		coins: "coins",
	},
	es: {
		prepare: "Clientes llegando",
		perfect: "Perfect",
		lastCall: "Ultima llamada! Todo debe irse",
		day: "Día",
		wave: "Oleada",
		left: "Restantes",
		thanksForPlaying: "Gracias por jugar",
		likesGiven: "likes dados",
		nowAvailable: "ya disponible",
		infiniteMode: "Modo infinito",
		newBadge: "NUEVO",
		upgradesAvailable: "Actualizaciones disponibles",
		buyUpgrades: "Comprar mejoras",
		newUnlock: "Nuevo desbloqueo",
		selectNewUpgrade: "SELECCIONA NUEVA MEJORA",
		areYouSureToExit: "¿Seguro que quieres\nsalir?",
		yes: "Sí",
		no: "No",
		newUpgradesAwait: "¡Hay nuevas mejoras en el\nmenú principal!",
		play: "Jugar",
		upgrades: "Mejoras",
		dayShort: "DÍA",
		earningsToday: "Ganancias de hoy",
		buy: "COMPRAR",
		coins: "monedas",
	},
};

/** Detecta idioma del navegador; por ahora en / es. */
export function getGameLanguage(): GameLanguage {
	if (typeof navigator === "undefined") {
		return "en";
	}

	const language = (navigator.language || "en").toLowerCase();
	return language.startsWith("es") ? "es" : "en";
}

export function t(key: TranslationKey, language = getGameLanguage()): string {
	return STRINGS[language][key] ?? STRINGS.en[key];
}
