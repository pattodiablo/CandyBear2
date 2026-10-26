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
 * Cuánto esperar tras el boot antes de empezar a pausar por blur de window.
 * Embebidos en el iframe de Poki, el foco de window es poco confiable al arrancar —
 * puede dar false (o dispararse un blur real) mientras Poki todavía está revelando el
 * iframe tras el click en "Play Now", sin que el jugador haya hecho nada raro. Si se
 * escuchara blur desde el frame 0 el juego arrancaría pausado y se quedaría así hasta
 * que el jugador tocara adentro del canvas.
 */
const BLUR_PAUSE_GRACE_MS = 3000;

/** true una vez pasado el período de gracia inicial; recién ahí el blur de window pausa. */
let blurPauseEnabled = false;

/**
 * true solo si el juego debe estar activo según visibilidad + foco.
 * document.hidden (pestaña realmente en segundo plano) siempre pausa. El foco de
 * window (document.hasFocus()) solo se tiene en cuenta pasado BLUR_PAUSE_GRACE_MS.
 */
function isGameWindowActive() {
	if (document.hidden) {
		return false;
	}

	if (blurPauseEnabled && !document.hasFocus()) {
		return false;
	}

	return true;
}

/**
 * Pausa el loop completo al pasar la pestaña a segundo plano o perder foco de window.
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

	// HIDDEN/VISIBLE (pestaña oculta de verdad) son señal confiable desde el frame 0.
	target.events.on(Phaser.Core.Events.HIDDEN, sync);
	target.events.on(Phaser.Core.Events.VISIBLE, sync);

	// BLUR/FOCUS de window: ver BLUR_PAUSE_GRACE_MS arriba. El listener se agrega ya,
	// pero isGameWindowActive() ignora el foco hasta que blurPauseEnabled sea true, así
	// que un blur falso durante el reveal del iframe de Poki no pausa nada.
	window.addEventListener("blur", sync);
	window.addEventListener("focus", sync);

	window.setTimeout(() => {
		blurPauseEnabled = true;
		sync();
	}, BLUR_PAUSE_GRACE_MS);
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