
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class LikeHeart extends Phaser.GameObjects.Image {

	constructor(
		scene: Phaser.Scene,
		x?: number,
		y?: number,
		texture?: string,
		frame?: number | string,
		onPopInComplete?: () => void
	) {
		super(scene, x ?? 0, y ?? 0, texture || "likeHeart", frame);

		/* START-USER-CTR-CODE */
		this.baseScaleX = this.scaleX;
		this.baseScaleY = this.scaleY;
		this.baseY = this.y;
		this.setScale(0);
		this.setAlpha(0);
		this.playFloatPopAnimation(onPopInComplete);
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	private static readonly RISE_OFFSET = 52;
	private static readonly POP_IN_DURATION = 220;
	private static readonly FLOAT_DURATION = 380;
	private static readonly POP_OUT_PEAK_SCALE = 1.28;
	private static readonly POP_OUT_DURATION = 160;
	private readonly baseScaleX: number;
	private readonly baseScaleY: number;
	private readonly baseY: number;

	private playFloatPopAnimation(onPopInComplete?: () => void) {

		this.scene.tweens.add({
			targets: this,
			scaleX: this.baseScaleX,
			scaleY: this.baseScaleY,
			alpha: 1,
			y: this.baseY - (LikeHeart.RISE_OFFSET * 0.45),
			duration: LikeHeart.POP_IN_DURATION,
			ease: "Back.Out",
			onComplete: () => {
				onPopInComplete?.();
				this.scene.tweens.add({
					targets: this,
					y: this.baseY - LikeHeart.RISE_OFFSET,
					duration: LikeHeart.FLOAT_DURATION,
					ease: "Sine.Out",
					onComplete: () => {
						this.playPopOut();
					}
				});
			}
		});
	}

	private playPopOut() {

		this.scene.tweens.add({
			targets: this,
			scaleX: this.baseScaleX * LikeHeart.POP_OUT_PEAK_SCALE,
			scaleY: this.baseScaleY * LikeHeart.POP_OUT_PEAK_SCALE,
			duration: LikeHeart.POP_OUT_DURATION * 0.45,
			ease: "Quad.Out",
			onComplete: () => {
				this.scene.tweens.add({
					targets: this,
					scaleX: 0,
					scaleY: 0,
					alpha: 0,
					duration: LikeHeart.POP_OUT_DURATION * 0.55,
					ease: "Back.In",
					onComplete: () => {
						this.destroy();
					}
				});
			}
		});
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
