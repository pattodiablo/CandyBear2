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

function setupFocusPause(target: Phaser.Game) {
	const sync = () => syncGamePauseToFocus(target);

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
	if (!game) {
		game = createGame();
		setupFocusPause(game);
		game.scene.start("Boot");

		window.addEventListener("resize", refreshGameScale);
		window.addEventListener("orientationchange", () => {
			window.setTimeout(refreshGameScale, 150);
			window.setTimeout(refreshGameScale, 400);
		});
	}

	refreshGameScale();
}

window.bootCandyBearGame = bootGame;
window.refreshCandyBearGameScale = refreshGameScale;

window.addEventListener("load", () => {
	window.dispatchEvent(new Event("candybear-game-ready"));

	if (!isMobileDevice()) {
		bootGame();
	}
});