import Phaser from "phaser";
import { SpinePlugin } from "@esotericsoftware/spine-phaser-v4";
import Level from "./scenes/Level";
import SceneSelector from "./scenes/SceneSelector";
import preloadAssetPackUrl from "../docs/assets/preload-asset-pack.json";
import Preload from "./scenes/Preload";

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
		scene: [Boot, Preload, Level, SceneSelector]
	});
}

function bootGame() {
	if (!game) {
		game = createGame();
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