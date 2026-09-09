
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class Reloj extends Phaser.GameObjects.Sprite {

	private static readonly CLOCK_FRAME_COUNT = 9;
	private static readonly CLOCK_FPS = 24;
	private clockTimer?: Phaser.Time.TimerEvent;
	private resetTween?: Phaser.Tweens.Tween;

	constructor(scene: Phaser.Scene, x?: number, y?: number, texture?: string, frame?: number | string) {
		super(scene, x ?? 0, y ?? 0, texture || "reloj", frame ?? 0);

		/* START-USER-CTR-CODE */
		this.setDepth(2000);
		this.setVisible(false);
		this.setFrame(0);
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	private getFullClockDurationMs() {
		return (Reloj.CLOCK_FRAME_COUNT / Reloj.CLOCK_FPS) * 1000;
	}

	public setClockActive(active: boolean) {
		this.clockTimer?.remove(false);
		this.clockTimer = undefined;
		this.resetTween?.stop();
		this.resetTween = undefined;

		if (active) {
			this.setVisible(true);
			this.setAlpha(1);
			this.setFrame(0);
			if (this.scene.anims.exists("relojAnim")) {
				this.play("relojAnim", true);
				this.anims.timeScale = 1;
			}
			return;
		}

		if (this.visible) {
			this.resetTween = this.scene.tweens.add({
				targets: this,
				alpha: { from: this.alpha, to: 0 },
				duration: 120,
				ease: "Sine.Out",
				onComplete: () => {
					this.anims.stop();
					this.setVisible(false);
					this.setFrame(0);
					this.setAlpha(1);
					this.resetTween = undefined;
				}
			});
			return;
		}

		this.anims.stop();
		this.setVisible(false);
		this.setFrame(0);
		this.setAlpha(1);
	}

	public setClockActiveForDuration(durationMs: number) {
		if (!durationMs || !Number.isFinite(durationMs) || durationMs <= 0) {
			this.setClockActive(false);
			return;
		}

		this.clockTimer?.remove(false);
		this.resetTween?.stop();
		this.resetTween = undefined;
		this.setVisible(true);
		this.setAlpha(1);
		this.setFrame(0);
		if (this.scene.anims.exists("relojAnim")) {
			this.play("relojAnim", true);
			const fullCycleMs = this.getFullClockDurationMs();
			this.anims.timeScale = fullCycleMs / durationMs;
		}
		this.clockTimer = this.scene.time.delayedCall(durationMs, () => {
			this.setClockActive(false);
		});
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
