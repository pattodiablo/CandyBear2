import Phaser from "phaser";
import { SpinePlugin } from "@esotericsoftware/spine-phaser-v4";
import Level from "./scenes/Level";
import SceneSelector from "./scenes/SceneSelector";
import preloadAssetPackUrl from "../static/assets/preload-asset-pack.json";
import Preload from "./scenes/Preload";

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

window.addEventListener('load', function () {
	
	const game = new Phaser.Game({
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
			autoCenter: Phaser.Scale.Center.CENTER_BOTH
		},
		scene: [Boot, Preload, Level, SceneSelector]
	});

	game.scene.start("Boot");
});