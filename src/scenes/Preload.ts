
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
import assetPackUrl from "../../static/assets/asset-pack.json";
import {
	hasOpenedGameBefore,
	markGameAsOpened,
	shouldShowCampaignCredits,
} from "./levelProgress";
/* END-USER-IMPORTS */

export default class Preload extends Phaser.Scene {

	constructor() {
		super("Preload");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// gameLogo
		this.add.image(647, 352, "GameLogo");

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	private static readonly BAR_WIDTH = 500;
	private static readonly BAR_HEIGHT = 30;
	private static readonly BAR_RADIUS = 15;
	private static readonly BAR_X = (1280 - Preload.BAR_WIDTH) * 0.5;
	private static readonly BAR_Y = 652;
	private static readonly TRACK_FILL_COLOR = 0xfff0e0;
	private static readonly TRACK_STROKE_COLOR = 0xa96625;
	private static readonly FILL_COLOR = 0xff5f7e;
	private static readonly FILL_HIGHLIGHT_COLOR = 0x72d7c7;

	private progressBarTrack!: Phaser.GameObjects.Graphics;
	private progressBarFill!: Phaser.GameObjects.Graphics;

	private createProgressBar() {
		this.progressBarTrack = this.add.graphics();
		this.progressBarFill = this.add.graphics();
		this.drawProgressBar(0);
	}

	private drawProgressBar(progress: number) {
		const clampedProgress = Phaser.Math.Clamp(progress, 0, 1);
		const fillWidth = Math.max(
			clampedProgress > 0 ? Preload.BAR_HEIGHT : 0,
			Preload.BAR_WIDTH * clampedProgress
		);

		this.progressBarTrack.clear();
		this.progressBarTrack.fillStyle(Preload.TRACK_FILL_COLOR, 1);
		this.progressBarTrack.lineStyle(4, Preload.TRACK_STROKE_COLOR, 1);
		this.progressBarTrack.fillRoundedRect(
			Preload.BAR_X,
			Preload.BAR_Y,
			Preload.BAR_WIDTH,
			Preload.BAR_HEIGHT,
			Preload.BAR_RADIUS
		);
		this.progressBarTrack.strokeRoundedRect(
			Preload.BAR_X,
			Preload.BAR_Y,
			Preload.BAR_WIDTH,
			Preload.BAR_HEIGHT,
			Preload.BAR_RADIUS
		);

		this.progressBarFill.clear();

		if (fillWidth <= 0) {
			return;
		}

		this.progressBarFill.fillStyle(Preload.FILL_COLOR, 1);
		this.progressBarFill.fillRoundedRect(
			Preload.BAR_X,
			Preload.BAR_Y,
			fillWidth,
			Preload.BAR_HEIGHT,
			Preload.BAR_RADIUS
		);

		const highlightWidth = Math.min(18, Math.max(0, fillWidth - Preload.BAR_RADIUS));
		if (highlightWidth > 0) {
			this.progressBarFill.fillStyle(Preload.FILL_HIGHLIGHT_COLOR, 0.85);
			this.progressBarFill.fillRoundedRect(
				Preload.BAR_X + fillWidth - highlightWidth,
				Preload.BAR_Y + 6,
				highlightWidth,
				Preload.BAR_HEIGHT - 12,
				(Math.min(Preload.BAR_HEIGHT - 12, highlightWidth)) * 0.5
			);
		}
	}

	preload() {

		this.editorCreate();
		this.createProgressBar();

		this.load.pack("asset-pack", assetPackUrl as unknown as string);

		this.load.on("progress", (value: number) => {
			this.drawProgressBar(value);
		});
	}

	create() {

		if (process.env.NODE_ENV === "development") {

			const start = new URLSearchParams(location.search).get("start");

			if (start) {

				console.log(`Development: jump to ${start}`);
				this.scene.start(start);

				return;
			}
		}

		if (!hasOpenedGameBefore()) {
			markGameAsOpened();
			this.scene.start("Level", { levelNumber: 1 });
			return;
		}

		// Si ya tiene la campaña perfecta y no vio los créditos, mostrarlos al arrancar.
		if (shouldShowCampaignCredits()) {
			this.scene.start("CredictsScene");
			return;
		}

		this.scene.start("SceneSelector");
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
