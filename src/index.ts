import Phaser from "phaser";
import { PokiPlugin } from "@poki/phaser-3";
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

let game: Phaser.Game | undefined;

/**
 * true solo si la pestaña/documento está oculto. OJO: a propósito NO se usa
 * document.hasFocus() acá. Embebidos en el iframe de Poki, el foco de window es poco
 * confiable — puede dar false (o dispararse un blur real de window) mientras Poki
 * todavía está revelando el iframe tras el click en "Play Now", sin que el jugador haya
 * hecho nada raro. Eso pausaba el juego entero (loop, timers, tweens) antes de pintar el
 * primer frame, y se quedaba así hasta que el jugador tocaba adentro del canvas.
 * document.hidden (pestaña realmente en segundo plano) es la señal confiable acá.
 */
function isGameWindowActive() {
	return !document.hidden;
}

/**
 * Pausa el loop completo al pasar la pestaña a segundo plano.
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

	// Deliberadamente NO se escuchan BLUR/FOCUS (foco de window): dentro de un iframe
	// no son confiables para decidir si pausar. Solo HIDDEN/VISIBLE (pestaña oculta de
	// verdad) son señal suficiente para pausar/reanudar el loop completo.
	target.events.on(Phaser.Core.Events.HIDDEN, sync);
	target.events.on(Phaser.Core.Events.VISIBLE, sync);
}

function createGame() {
	return new Phaser.Game({
		width: 1280,
		height: 720,
		backgroundColor: "#FEF6E7",
		plugins: {
			global: [
				{
					key: "poki",
					plugin: PokiPlugin,
					start: true,
					data: {
						loadingSceneKey: "Preload",
						gameplaySceneKey: "Level",
						// El plugin dispara commercialBreak() solo con cada scene.start("Level"),
						// sin saber nada de nuestra regla "solo desde el día 5" (Level.ts,
						// startNextLevelAfterOptionalBreak). Con autoCommercialBreak activo salían
						// anuncios en TODOS los cambios de día, y desde el día 5 salían dos seguidos
						// (el automático + el nuestro). Lo apagamos y dejamos el control 100% manual.
						autoCommercialBreak: false,
					}
				}
			],
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
			width: 1280,
			height: 720,
		},
		scene: [Boot, Preload, Level, SceneSelector, CredictsScene]
	});
}

function unlockAudioDevice() {
	if (!game?.sound) {
		return;
	}

	try {
		const soundManager = game.sound as any;
		const context = soundManager?.context;
		if (context && typeof context.resume === "function" && context.state === "suspended") {
			void context.resume();
		}
		if (typeof soundManager.resumeAll === "function") {
			soundManager.resumeAll();
		}
	} catch (error) {
		console.warn("[Audio] no se pudo desbloquear el dispositivo de audio.", error);
	}
}

function installAudioUnlockHandlers() {
	const events = ["pointerdown", "touchstart", "keydown", "click", "mousedown"];
	for (const eventName of events) {
		window.addEventListener(eventName, unlockAudioDevice, { passive: true, once: true });
	}
}

/**
 * Fuerza a Phaser a re-medir su contenedor y reescalar el canvas. Poki carga el juego
 * dentro de un iframe detrás de su propio botón "Play Now"; si ese iframe todavía no
 * tenía su tamaño final cuando Phaser hizo su primer cálculo (o quedó tapado por el
 * overlay de Poki), el canvas puede quedar en negro hasta que algo dispare un resize.
 * Por eso se llama tanto justo después de arrancar como ante cualquier señal de que el
 * documento pasó a estar visible/con foco.
 */
function refreshGameScale() {
	game?.scale.refresh();
}

window.refreshCandyBearGameScale = refreshGameScale;

function scheduleScaleRefresh() {
	refreshGameScale();
	window.requestAnimationFrame(refreshGameScale);
	window.setTimeout(refreshGameScale, 150);
	window.setTimeout(refreshGameScale, 400);
	window.setTimeout(refreshGameScale, 1000);
}

function installScaleRefreshHandlers() {
	document.addEventListener("visibilitychange", () => {
		if (!document.hidden) {
			scheduleScaleRefresh();
		}
	});
	window.addEventListener("focus", scheduleScaleRefresh);
	window.addEventListener("pageshow", scheduleScaleRefresh);
}

function bootGame() {
	if (!game) {
		game = createGame();
		setupFocusPause(game);
		installAudioUnlockHandlers();
		installScaleRefreshHandlers();
		game.scene.start("Boot");
		scheduleScaleRefresh();
	}
}

window.bootCandyBearGame = bootGame;

window.addEventListener("load", () => {
	window.dispatchEvent(new Event("candybear-game-ready"));
	bootGame();
});