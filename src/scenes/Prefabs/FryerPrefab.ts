
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import {
	getMachineAnimationTimeScale,
	getFryerSpeedBonus,
} from "../momentUpgradeBonuses";
/* END-USER-IMPORTS */

export default class FryerPrefab extends Phaser.GameObjects.Container {

	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? 0, y ?? 0);

		// fryer
		const fryer = scene.add.sprite(0, 0, "FryerAnim", 0);
		this.add(fryer);

		this.fryer = fryer;

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	public fryer: Phaser.GameObjects.Sprite;

	/* START-USER-CODE */

	private static readonly IDLE_TEXTURE_KEY = "FryerAnim";
	private static readonly IDLE_TEXTURE_FRAME = 0;
	private static readonly LOCKED_TEXTURE_KEY = "lockedFryer";

	private idleFryerAppearance: { key: string; frame?: string | number } = {
		key: FryerPrefab.IDLE_TEXTURE_KEY,
		frame: FryerPrefab.IDLE_TEXTURE_FRAME,
	};

	public setFryerTexture(textureKey: string) {

		this.idleFryerAppearance = textureKey === FryerPrefab.LOCKED_TEXTURE_KEY
			? { key: textureKey }
			: {
				key: FryerPrefab.IDLE_TEXTURE_KEY,
				frame: FryerPrefab.IDLE_TEXTURE_FRAME,
			};
		this.resetFryerAppearance();
	}

	public playFryAnimation() {

		this.stopFryAnimation();
		this.fryer.setTexture(FryerPrefab.IDLE_TEXTURE_KEY, FryerPrefab.IDLE_TEXTURE_FRAME);

		if (!this.scene.anims.exists("fryerAnimation")) {
			return;
		}

		this.fryer.anims.timeScale = getMachineAnimationTimeScale(getFryerSpeedBonus());
		this.fryer.play({ key: "fryerAnimation", repeat: -1 });
	}

	public resetFryerAppearance() {

		this.stopFryAnimation();
		this.applyFryerAppearance(this.idleFryerAppearance);
	}

	private stopFryAnimation() {

		this.fryer.anims.stop();
		this.fryer.anims.timeScale = 1;
		this.fryer.removeAllListeners(Phaser.Animations.Events.ANIMATION_COMPLETE);
	}

	private applyFryerAppearance(appearance: { key: string; frame?: string | number }) {

		if (appearance.frame !== undefined) {
			this.fryer.setTexture(appearance.key, appearance.frame);
			return;
		}

		this.fryer.setTexture(appearance.key);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here