import type { PokiPlugin } from "@poki/phaser-3";
import type Phaser from "phaser";

/** True while a commercial/rewarded break owns game.pause — focus handlers must not fight it. */
let pokiBreakActive = false;

/** Tracks whether we already told Poki that gameplay is active (avoids duplicate start/stop). */
let pokiGameplayActive = false;

export function isPokiBreakActive(): boolean {
	return pokiBreakActive;
}

export function isPokiGameplayActive(): boolean {
	return pokiGameplayActive;
}

/** Returns the global Poki Phaser plugin, or null if it is not registered. */
export function getPokiPlugin(scene: Phaser.Scene): PokiPlugin | null {
	const plugin = scene.plugins.get("poki") as PokiPlugin | undefined;
	return plugin ?? null;
}

/**
 * Pause gameplay systems, request a commercial break, then resume.
 * Safe to call when the SDK is unavailable (adblock / offline / still loading).
 * Caller should fire gameplayStop before and gameplayStart after.
 */
export async function runPokiCommercialBreak(scene: Phaser.Scene): Promise<void> {
	const poki = getPokiPlugin(scene);

	if (!poki) {
		return;
	}

	const game = scene.game;
	const wasGamePaused = game.isPaused;
	pokiBreakActive = true;

	// Freeze the loop so clients/timers do not advance under the ad (touch-first game).
	if (!wasGamePaused) {
		game.pause();
	}

	try {
		await poki.commercialBreak();
	} catch {
		// Ads may fail offline or with blockers — continue the game either way.
	} finally {
		pokiBreakActive = false;

		if (!wasGamePaused && game.isPaused) {
			game.resume();
		}
	}
}

/** Notify Poki that loading finished (safe if the plugin is missing). */
export function notifyPokiGameLoadingFinished(scene: Phaser.Scene): void {
	getPokiPlugin(scene)?.gameLoadingFinished();
}

/**
 * gameplayStart — call when the player starts playing:
 * Ready/Play on a level, or resume after pause.
 */
export function notifyPokiGameplayStart(scene: Phaser.Scene): void {
	if (pokiGameplayActive) {
		return;
	}

	const poki = getPokiPlugin(scene);

	if (!poki) {
		return;
	}

	pokiGameplayActive = true;
	poki.gameplayStart();
}

/**
 * gameplayStop — call when the player is not playing:
 * pause, exit to menu, level results, scene leave.
 */
export function notifyPokiGameplayStop(scene: Phaser.Scene): void {
	if (!pokiGameplayActive) {
		return;
	}

	const poki = getPokiPlugin(scene);

	if (!poki) {
		pokiGameplayActive = false;
		return;
	}

	pokiGameplayActive = false;
	poki.gameplayStop();
}
