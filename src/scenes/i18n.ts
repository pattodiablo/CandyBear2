export type GameLanguage = "en" | "es";

type TranslationKey = "prepare" | "perfect" | "lastCall";

const STRINGS: Record<GameLanguage, Record<TranslationKey, string>> = {
	en: {
		prepare: "Clients coming",
		perfect: "Perfect",
		lastCall: "Last Call! Everything Must Go",
	},
	es: {
		prepare: "Clientes llegando",
		perfect: "Perfect",
		lastCall: "Ultima llamada! Todo debe irse",
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
