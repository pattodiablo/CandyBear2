import Phaser from "phaser";
import { SpinePlugin } from "@esotericsoftware/spine-phaser-v4";
import { EVENT_INITIALIZED, PokiPlugin } from "@poki/phaser-3";
import Level from "./scenes/Level";
import SceneSelector from "./scenes/SceneSelector";
import preloadAssetPackUrl from "../static/assets/preload-asset-pack.json";
import Preload from "./scenes/Preload";
import CredictsScene from "./scenes/CredictsScene";
import { isPokiBreakActive } from "./pokiHelpers";

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
 *
 * Skip while a commercial/rewarded break owns pause (see pokiHelpers).
 */
function syncGamePauseToFocus(target: Phaser.Game) {
	if (isPokiBreakActive()) {
		return;
	}

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

/**
 * On Poki.com the game sits in a scrollable page — block space/arrows/wheel
 * from scrolling the host page while playing.
 */
function setupPokiPageGuards() {
	window.addEventListener("keydown", (event) => {
		if (["ArrowDown", "ArrowUp", " "].includes(event.key)) {
			event.preventDefault();
		}
	});
	window.addEventListener("wheel", (event) => event.preventDefault(), { passive: false });
}

function setupPokiDebug(target: Phaser.Game) {
	if (process.env.NODE_ENV !== "development") {
		return;
	}

	target.events.once(EVENT_INITIALIZED, (poki: InstanceType<typeof PokiPlugin>) => {
		// Inspector / local testing: verbose logs + debug ads behaviour.
		poki.setLogging?.(true);
		poki.setDebug?.(true);
		console.info(
			"[Poki] SDK ready",
			{
				initialized: poki.initialized,
				hasAdblock: poki.hasAdblock,
			}
		);
	});
}

function createGame() {
	return new Phaser.Game({
		width: 1280,
		height: 720,
		backgroundColor: "#FEF6E7",
		plugins: {
			global: [
				{
					plugin: PokiPlugin,
					key: "poki",
					// Must be true so the plugin loads the Poki SDK script.
					start: true,
					data: {
						// Must match the *class name* of the loading scene (plugin uses constructor.name).
						loadingSceneKey: "Preload",
						// gameplayStart/Stop are fired manually in Level:
						// start on Ready/Play, stop on pause/exit (not on scene enter/intro).
						autoCommercialBreak: false,
					},
				},
			],
			scene: [
				{
					key: "spine.SpinePlugin",
					plugin: SpinePlugin,
					mapping: "spine",
				},
			],
		},
		scale: {
			mode: Phaser.Scale.ScaleModes.FIT,
			autoCenter: Phaser.Scale.Center.CENTER_BOTH,
			resizeInterval: 250,
		},
		scene: [Boot, Preload, Level, SceneSelector, CredictsScene],
	});
}

function bootGame() {
	if (game) {
		return;
	}

	setupPokiPageGuards();
	game = createGame();
	setupFocusPause(game);
	setupPokiDebug(game);
	// First scene in config already boots Boot; avoid a redundant restart.

	window.addEventListener("resize", refreshGameScale);
	window.addEventListener("orientationchange", () => {
		window.setTimeout(refreshGameScale, 150);
		window.setTimeout(refreshGameScale, 400);
	});

	refreshGameScale();
}

// Poki handles mobile fullscreen itself — always boot on load (desktop + mobile).
window.addEventListener("load", () => {
	bootGame();
});