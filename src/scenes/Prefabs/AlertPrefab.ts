
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class AlertPrefab extends Phaser.GameObjects.Image {

	private pulseTween?: Phaser.Tweens.Tween;
	private baseScale = 0.7;

	constructor(scene: Phaser.Scene, x?: number, y?: number, texture?: string, frame?: number | string) {
		super(scene, x ?? 0, y ?? 0, texture || "alert", frame);

		/* START-USER-CTR-CODE */
		this.setOrigin(0.5);
		this.setAlpha(0);
		this.setVisible(false);
		this.setScale(this.baseScale);
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	public updateBurnProgress(progress: number) {
		if (!this.active || !this.scene) {
			this.stopPulse();
			return;
		}

		const normalized = Phaser.Math.Clamp(progress, 0, 1);
		const isVisible = normalized > 0.02;

		this.setVisible(isVisible);

		if (!isVisible) {
			this.stopPulse();
			this.clearTint();
			this.setAlpha(0);
			return;
		}

		if (normalized >= 0.98) {
			this.stopPulse();
			this.clearTint();
			this.setAlpha(0.95);
			this.setScale(this.baseScale + 0.08);
			return;
		}

		this.clearTint();
		this.setAlpha(0.2 + normalized * 0.8);
		this.setScale(this.baseScale + normalized * 0.35);

		if (!this.pulseTween) {
			this.startPulse();
		}
	}

	public stopPulse() {
		this.pulseTween?.stop();
		this.pulseTween = undefined;
	}

	private startPulse() {
		this.stopPulse();
		if (!this.scene) {
			return;
		}

		this.pulseTween = this.scene.tweens.add({
			targets: this,
			alpha: { from: 0.3, to: 1 },
			scaleX: { from: this.baseScale, to: this.baseScale + 0.18 },
			scaleY: { from: this.baseScale, to: this.baseScale + 0.18 },
			duration: 220,
			yoyo: true,
			repeat: -1,
			ease: "Sine.InOut",
		});
	}

	destroy(fromScene?: boolean) {
		this.stopPulse();
		super.destroy(fromScene);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
