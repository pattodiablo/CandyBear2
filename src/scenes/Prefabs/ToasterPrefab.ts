
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export type ToasterSlotId = "toasterSlot1";

export default class ToasterPrefab extends Phaser.GameObjects.Container {

	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? 0, y ?? 0);

		// toaster
		const toaster = scene.add.image(0, 0, "toaster");
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

	public toaster: Phaser.GameObjects.Image;
	private toasterDestination: Phaser.GameObjects.Image;

	/* START-USER-CODE */

	// Write your code here.
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
		const sprite = this.scene.add.sprite(dest.x, dest.y, "sandWichAnim", "sandwich0001.png");
		sprite.setDepth(this.toaster.depth + 1);

		if (!this.scene.anims.exists("sandwichRoast")) {
			sprite.setFrame("sandwich005.png");
			sprite.destroy();
			onComplete?.();
			return sprite;
		}

		sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
			sprite.stop();
			sprite.destroy();
			onComplete?.();
		});

		sprite.play({ key: "sandwichRoast", repeat: 0 });
		return sprite;
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
