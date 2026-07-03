
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import {
	getMachineAnimationTimeScale,
	getToasterSpeedBonus,
} from "../momentUpgradeBonuses";
/* END-USER-IMPORTS */

export type ToasterSlotId = "toasterSlot1";

export default class ToasterPrefab extends Phaser.GameObjects.Container {

	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? 0, y ?? 0);

		// toaster
		const toaster = scene.add.sprite(0, 0, "toasterAnim", 0);
		this.add(toaster);

		// toasterDestination
		const toasterDestination = scene.add.image(-1, 45, "_MISSING");
		toasterDestination.visible = false;
		this.add(toasterDestination);

		this.toaster = toaster;
		this.toasterDestination = toasterDestination;

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	public toaster: Phaser.GameObjects.Sprite;
	private toasterDestination: Phaser.GameObjects.Image;

	/* START-USER-CODE */

	private static readonly IDLE_TEXTURE_KEY = "toasterAnim";
	private static readonly IDLE_TEXTURE_FRAME = 0;

	private static readonly LOCKED_TEXTURE_KEY = "lockedToaster";

	private idleToasterAppearance: { key: string; frame?: string | number } = {
		key: ToasterPrefab.IDLE_TEXTURE_KEY,
		frame: ToasterPrefab.IDLE_TEXTURE_FRAME,
	};

	public setToasterTexture(textureKey: string) {

		this.idleToasterAppearance = textureKey === ToasterPrefab.LOCKED_TEXTURE_KEY
			? { key: textureKey }
			: {
				key: ToasterPrefab.IDLE_TEXTURE_KEY,
				frame: ToasterPrefab.IDLE_TEXTURE_FRAME,
			};
		this.resetToasterAppearance();
	}

	private resetToasterAppearance() {

		this.toaster.anims.stop();
		this.toaster.anims.timeScale = 1;
		this.applyToasterAppearance(this.idleToasterAppearance);
	}

	private applyToasterAppearance(appearance: { key: string; frame?: string | number }) {

		if (appearance.frame !== undefined) {
			this.toaster.setTexture(appearance.key, appearance.frame);
			return;
		}

		this.toaster.setTexture(appearance.key);
	}

	private stopToasterAnimation() {

		this.toaster.anims.stop();
		this.toaster.anims.timeScale = 1;
		this.toaster.removeAllListeners(Phaser.Animations.Events.ANIMATION_COMPLETE);
	}

	public getSlotTarget(_slotId: ToasterSlotId) {

		const marker = this.toasterDestination;
		const worldPoint = new Phaser.Math.Vector2();
		this.getWorldTransformMatrix().transformPoint(marker.x, marker.y, worldPoint);
		return worldPoint;
	}

	public getDestinationPoint() {

		return this.getSlotTarget("toasterSlot1");
	}

	public roastSandwich(onComplete?: () => void) {
		const dest = this.getDestinationPoint();
		const sandwichSprite = this.scene.add.sprite(dest.x, dest.y, "sandWichAnim", "sandwich0001.png");
		sandwichSprite.setDepth(this.toaster.depth + 1);
		const animationTimeScale = getMachineAnimationTimeScale(getToasterSpeedBonus());

		const finishRoast = () => {
			this.stopToasterAnimation();
			this.resetToasterAppearance();
			onComplete?.();
		};

		if (!this.scene.anims.exists("sandwichRoast")) {
			sandwichSprite.setFrame("sandwich005.png");
			sandwichSprite.destroy();
			finishRoast();
			return sandwichSprite;
		}

		sandwichSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
			sandwichSprite.anims.timeScale = 1;
			sandwichSprite.stop();
			sandwichSprite.destroy();
			finishRoast();
		});

		this.stopToasterAnimation();
		this.toaster.setTexture(ToasterPrefab.IDLE_TEXTURE_KEY, ToasterPrefab.IDLE_TEXTURE_FRAME);

		if (this.scene.anims.exists("toasterAnimation")) {
			this.toaster.anims.timeScale = animationTimeScale;
			this.toaster.play({ key: "toasterAnimation", repeat: 0 });
		}

		sandwichSprite.anims.timeScale = animationTimeScale;
		sandwichSprite.play({ key: "sandwichRoast", repeat: 0 });
		return sandwichSprite;
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
