import Phaser from "phaser";
import { SpinePlugin } from "@esotericsoftware/spine-phaser-v4";
import Level from "./scenes/Level";
import SceneSelector from "./scenes/SceneSelector";
import preloadAssetPackUrl from "../static/assets/preload-asset-pack.json";
import Preload from "./scenes/Preload";
import CredictsScene from "./scenes/CredictsScene";

declare global {
	interface Window {
		bootCandyBearGame?: () => void;
		refreshCandyBearGameScale?: () => void;
		CrazyGames?: {
			SDK: {
				environment: string;
				init: () => Promise<void>;
				game: {
					settings?: { muteAudio?: boolean; disableChat?: boolean };
					loadingStart: () => void;
					loadingStop: () => void;
					gameplayStart: () => void;
					gameplayStop: () => void;
					addSettingsChangeListener?: (listener: (settings: { muteAudio?: boolean; disableChat?: boolean }) => void) => void;
					removeSettingsChangeListener?: (listener: (settings: { muteAudio?: boolean; disableChat?: boolean }) => void) => void;
					reportGameCompletedPercentage?: (percentage: number) => void;
					setGameContext?: (context: Record<string, unknown>) => void;
					clearGameContext?: () => void;
				};
			};
		};
	}
}

class Boot extends Phaser.Scene {

	constructor() {
		super("Boot");
	}

	preload() {

		this.load.pack("pack", preloadAssetPackUrl as unknown as string);
	}

	create() {

		this.scene.start("Preload");
	}
}

function isMobileDevice() {
	return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
		|| (navigator.maxTouchPoints > 0 && Math.min(window.screen.width, window.screen.height) < 1024);
}

let game: Phaser.Game | undefined;

function refreshGameScale() {
	game?.scale.refresh();
}

/** true solo si la pestaña está visible y la ventana tiene foco. */
function isGameWindowActive() {
	return !document.hidden && document.hasFocus();
}

/**
 * Pausa el loop completo al perder foco / cambiar de pestaña.
 * Phaser ya pausa audio con pauseOnBlur; esto congela timers, tweens y update.
 */
function syncGamePauseToFocus(target: Phaser.Game) {
	if (isGameWindowActive()) {
		if (target.isPaused) {
			target.resume();
		}
		return;
	}

	if (!target.isPaused) {
		target.pause();
	}
}

function isCrazyGamesAvailable() {
	return typeof window !== "undefined"
		&& !!window.CrazyGames
		&& !!window.CrazyGames.SDK
		&& (window.CrazyGames.SDK.environment === "crazygames" || window.CrazyGames.SDK.environment === "local");
}

async function initCrazyGamesSdk() {
	if (!isCrazyGamesAvailable()) {
		return;
	}

	try {
		await window.CrazyGames!.SDK.init();
		console.info("CrazyGames SDK initialized", window.CrazyGames!.SDK.environment);
	} catch (error) {
		console.warn("CrazyGames SDK init failed", error);
	}
}

function applyCrazyGamesAudioSettings(target?: Phaser.Game) {
	if (!isCrazyGamesAvailable()) {
		return;
	}

	const muteAudio = window.CrazyGames!.SDK.game.settings?.muteAudio === true;
	const soundManager = target?.sound ?? game?.sound;
	if (soundManager) {
		soundManager.mute = muteAudio;
	}
}

function watchCrazyGamesAudioSettings() {
	if (!isCrazyGamesAvailable() || !window.CrazyGames!.SDK.game.addSettingsChangeListener) {
		return;
	}

	const settingsListener = (newSettings: { muteAudio?: boolean; disableChat?: boolean }) => {
		const muteAudio = newSettings.muteAudio === true;
		if (game) {
			game.sound.mute = muteAudio;
		}
	};

	window.CrazyGames!.SDK.game.addSettingsChangeListener(settingsListener);
}

function syncCrazyGamesGameplayState(isPlaying: boolean) {
	if (!isCrazyGamesAvailable()) {
		return;
	}

	if (isPlaying) {
		window.CrazyGames!.SDK.game.gameplayStart();
		return;
	}

	window.CrazyGames!.SDK.game.gameplayStop();
}

function setupFocusPause(target: Phaser.Game) {
	const sync = () => {
		syncGamePauseToFocus(target);
		syncCrazyGamesGameplayState(isGameWindowActive());
	};

	target.events.on(Phaser.Core.Events.BLUR, sync);
	target.events.on(Phaser.Core.Events.FOCUS, sync);
	target.events.on(Phaser.Core.Events.HIDDEN, sync);
	target.events.on(Phaser.Core.Events.VISIBLE, sync);

	// Por si arranca en segundo plano (móvil / pestaña en background).
	sync();
}

function createGame() {
	return new Phaser.Game({
		width: 1280,
		height: 720,
		backgroundColor: "#FEF6E7",
		plugins: {
			scene: [
				{
					key: "spine.SpinePlugin",
					plugin: SpinePlugin,
					mapping: "spine"
				}
			]
		},
		scale: {
			mode: Phaser.Scale.ScaleModes.FIT,
			autoCenter: Phaser.Scale.Center.CENTER_BOTH,
			resizeInterval: 250,
		},
		scene: [Boot, Preload, Level, SceneSelector, CredictsScene]
	});
}

function bootGame() {
	if (isCrazyGamesAvailable()) {
		window.CrazyGames!.SDK.game.loadingStart();
	}

	if (!game) {
		game = createGame();
		setupFocusPause(game);
		applyCrazyGamesAudioSettings(game);
		game.scene.start("Boot");

		window.addEventListener("resize", refreshGameScale);
		window.addEventListener("orientationchange", () => {
			window.setTimeout(refreshGameScale, 150);
			window.setTimeout(refreshGameScale, 400);
		});
	}

	if (isCrazyGamesAvailable()) {
		syncCrazyGamesGameplayState(true);
		window.CrazyGames!.SDK.game.loadingStop();
	}

	refreshGameScale();
}

window.bootCandyBearGame = bootGame;
window.refreshCandyBearGameScale = refreshGameScale;

window.addEventListener("load", async () => {
	window.dispatchEvent(new Event("candybear-game-ready"));
	await initCrazyGamesSdk();
	watchCrazyGamesAudioSettings();
	applyCrazyGamesAudioSettings();

	if (!isMobileDevice()) {
		bootGame();
	}
});