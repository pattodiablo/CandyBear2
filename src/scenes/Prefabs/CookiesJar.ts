
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
import type Level from "../Level";
/* END-USER-IMPORTS */

export default class CookiesJar extends Phaser.GameObjects.Image {

	constructor(scene: Phaser.Scene, x?: number, y?: number, texture?: string, frame?: number | string) {
		super(scene, x ?? 0, y ?? 0, texture || "cookieJar", frame);

		/* START-USER-CTR-CODE */
		this.baseScaleX = this.scaleX;
		this.baseScaleY = this.scaleY;
		this.setInteractive({ useHandCursor: true });
		this.on(Phaser.Input.Events.POINTER_OVER, this.handlePointerOver, this);
		this.on(Phaser.Input.Events.POINTER_OUT, this.handlePointerOut, this);
		this.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	private static readonly HOVER_SCALE = 1.08;
	private static readonly PRESSED_SCALE = 0.94;
	private static readonly TWEEN_DURATION = 100;
	private readonly baseScaleX: number;
	private readonly baseScaleY: number;
	private isPressed = false;

	private handlePointerOver() {
		if (this.isPressed) {
			return;
		}

		this.animateScale(this.baseScaleX * CookiesJar.HOVER_SCALE, this.baseScaleY * CookiesJar.HOVER_SCALE);
	}

	private handlePointerOut() {
		if (this.isPressed) {
			return;
		}

		this.animateScale(this.baseScaleX, this.baseScaleY);
	}

	private handlePointerDown() {
		const levelScene = this.scene as Level;

		if (!levelScene.tryLaunchCookieReward(this.x, this.y)) {
			this.scene.sound.play("deny");
			return;
		}

		this.isPressed = true;
		this.scene.sound.play("pop3");
		this.animateScale(
			this.baseScaleX * CookiesJar.PRESSED_SCALE,
			this.baseScaleY * CookiesJar.PRESSED_SCALE,
			() => {
				this.isPressed = false;
				this.animateScale(this.baseScaleX, this.baseScaleY);
			}
		);
	}

	private animateScale(scaleX: number, scaleY: number, onComplete?: () => void) {
		this.scene.tweens.killTweensOf(this);
		this.scene.tweens.add({
			targets: this,
			scaleX,
			scaleY,
			duration: CookiesJar.TWEEN_DURATION,
			ease: "Quad.Out",
			onComplete,
		});
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here