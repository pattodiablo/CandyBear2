/**
 * Thin wrapper around the global `window.FRVR` SDK (loaded via <script> tags in
 * index.html — see https://docs.frvr.com/engines/web/quickstart/). There is no
 * npm package: FRVR ships as a global, so every call here is guarded in case the
 * SDK failed to load (adblock / offline / still loading).
 */

interface FrvrAdShowResult {
	NOT_DISPLAYED: "NOT_DISPLAYED";
	DELIVERED: "DELIVERED";
	COMPLETED: "COMPLETED";
}

interface FrvrAdType {
	INTERSTITIAL: "INTERSTITIAL";
	REWARD: "REWARD";
	BANNER: "BANNER";
}

interface FrvrSdk {
	config: Record<string, unknown>;
	lifecycle: {
		onSuspend?: () => void;
		onResume?: () => void;
		onAudioSuspend?: () => void;
		onAudioResume?: () => void;
		onGamePause?: () => void;
	};
	init: (environment?: "dev" | "prod") => void;
	bootstrapper: {
		init: () => Promise<void>;
		setProgress: (progress: number) => void;
		complete: () => void;
	};
	ads: {
		AdType: FrvrAdType;
		AdShowResult: FrvrAdShowResult;
		show: (type: FrvrAdType[keyof FrvrAdType]) => Promise<FrvrAdShowResult[keyof FrvrAdShowResult]>;
	};
	tracker: {
		logEvent: (name: string, fields?: Record<string, unknown>) => void;
	};
}

declare global {
	interface Window {
		FRVR?: FrvrSdk;
	}
}

function getFrvr(): FrvrSdk | null {
	return window.FRVR ?? null;
}

/** gameId from the FRVR dashboard (dev channel locally; FRVR's pipeline supplies the real config at packaging time). */
const FRVR_GAME_ID = "GUAO49C";

export interface FrvrLifecycleCallbacks {
	onSuspend: () => void;
	onResume: () => void;
	onAudioSuspend: () => void;
	onAudioResume: () => void;
	onGamePause: () => void;
}

/** Sets FRVR.config + the required lifecycle hooks, then calls FRVR.init(). */
export function initializeFrvrSdk(callbacks: FrvrLifecycleCallbacks): void {
	const frvr = getFrvr();

	if (!frvr) {
		return;
	}

	try {
		frvr.config = { gameId: FRVR_GAME_ID };
		frvr.lifecycle.onSuspend = callbacks.onSuspend;
		frvr.lifecycle.onResume = callbacks.onResume;
		frvr.lifecycle.onAudioSuspend = callbacks.onAudioSuspend;
		frvr.lifecycle.onAudioResume = callbacks.onAudioResume;
		frvr.lifecycle.onGamePause = callbacks.onGamePause;
		frvr.init();
	} catch {
		// SDK missing/broken — the game must still run standalone.
	}
}

/** Shows the channel splash. Resolves immediately; call notifyFrvrGameLoadingFinished() once assets are ready. */
export function startFrvrBootstrapper(): Promise<void> {
	const frvr = getFrvr();

	if (!frvr) {
		return Promise.resolve();
	}

	try {
		return frvr.bootstrapper.init();
	} catch {
		return Promise.resolve();
	}
}

/** Hides the FRVR bootstrapper splash. Call once the Preload scene is done. */
export function notifyFrvrGameLoadingFinished(): void {
	try {
		getFrvr()?.bootstrapper.complete();
	} catch {
		// SDK may not be ready yet; must not break the game flow.
	}
}

/** Feeds asset-load progress (0..1) into the FRVR bootstrapper splash. */
export function setFrvrBootstrapProgress(progress: number): void {
	try {
		getFrvr()?.bootstrapper.setProgress(progress);
	} catch {
		// Safe to ignore before the SDK/bootstrapper is ready.
	}
}

/**
 * Shows a full-screen interstitial. FRVR pauses the game loop and audio via the
 * lifecycle hooks automatically, so no manual pause/resume is needed here.
 * Safe to call when the SDK is unavailable (adblock / offline / still loading).
 */
export async function runFrvrInterstitialBreak(): Promise<void> {
	const frvr = getFrvr();

	if (!frvr) {
		return;
	}

	try {
		await frvr.ads.show(frvr.ads.AdType.INTERSTITIAL);
	} catch {
		// Ads may fail offline or with blockers — continue the game either way.
	}
}

/**
 * Custom funnel event (FRVR.tracker.logEvent): siempre se loguea en consola para
 * poder depurarlo localmente, y además se manda al SDK de FRVR si está disponible
 * (adblock / offline / aún cargando → no-op silencioso).
 */
export function trackFrvrEvent(category: string, what: string, action: string): void {
	// eslint-disable-next-line no-console
	console.log(`[FRVR event] ${category} / ${what} / ${action}`);

	try {
		getFrvr()?.tracker.logEvent(`${category}_${what}`, { action });
	} catch {
		// El SDK puede no estar listo todavía; no debe romper el flujo del juego.
	}
}
