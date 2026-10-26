
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
	private hasBeenTapped = false;

	/**
	 * Permite que el jugador toque la moneda para recogerla al instante, en vez de
	 * esperar a la autocolecta. Se habilita recién cuando la moneda ya aterrizó
	 * (ver showCoinsAt en Level.ts). `onTap` corre una sola vez.
	 */
	public enableTapToCollect(onTap: () => void) {

		if (!this.active || this.hasBeenTapped) {
			return;
		}

		this.setInteractive({ useHandCursor: true });
		this.once(Phaser.Input.Events.POINTER_DOWN, () => {
			if (this.hasBeenTapped) {
				return;
			}

			this.hasBeenTapped = true;
			onTap();
		});
	}

	public playCollectAnimation(onComplete?: () => void) {

		this.hasBeenTapped = true;
		this.disableInteractive();

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
