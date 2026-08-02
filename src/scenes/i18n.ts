export type GameLanguage = "en" | "es";

type TranslationKey = "prepare" | "perfect";

const STRINGS: Record<GameLanguage, Record<TranslationKey, string>> = {
	en: {
		prepare: "Clients coming",
		perfect: "Perfect",
	},
	es: {
		prepare: "Clientes llegando",
		perfect: "Perfect",
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
