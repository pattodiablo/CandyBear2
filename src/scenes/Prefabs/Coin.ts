
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
/* END-USER-IMPORTS */

export default class Coin extends Phaser.GameObjects.Image {

	constructor(scene: Phaser.Scene, x?: number, y?: number, texture?: string, frame?: number | string) {
		super(scene, x ?? 0, y ?? 0, texture || "coin", frame);

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	public playCollectAnimation(onComplete?: () => void) {

		this.scene.tweens.add({
			targets: this,
			y: this.y - Phaser.Math.Between(18, 28),
			alpha: 0,
			scaleX: 0.45,
			scaleY: 0.45,
			duration: 240,
			ease: "Sine.Out",
			onComplete: () => {
				onComplete?.();
				this.destroy();
			}
		});
	}

	// Write your code here.

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
