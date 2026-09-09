
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class HelpHand extends Phaser.GameObjects.Image {

	constructor(scene: Phaser.Scene, x?: number, y?: number, texture?: string, frame?: number | string) {
		super(scene, x ?? 0, y ?? 0, texture || "TutiorialHand", frame);

		this.setOrigin(1, 1.5);

		/* START-USER-CTR-CODE */
		this.setAlpha(0);
		this.setVisible(false);
		this.startFloating();
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	private static readonly FLOAT_DISTANCE = 8;
	private static readonly FLOAT_DURATION = 780;
	private static readonly FADE_IN_DURATION = 200;
	private static readonly FADE_OUT_DURATION = 160;
	private static readonly TARGET_CHANGE_THRESHOLD = 14;
	private static readonly POINT_OFFSET_X = 30;
	private static readonly POINT_OFFSET_Y = 34;

	private restX = 0;
	private restY = 0;
	private floatOffset = 0;
	private isShown = false;
	private floatTween?: Phaser.Tweens.Tween;
	private fadeTween?: Phaser.Tweens.Tween;
	private pulseTween?: Phaser.Tweens.Tween;
	private clickWaveGraphics?: Phaser.GameObjects.Graphics;
	private clickWaveTween?: Phaser.Tweens.Tween;

	private startFloating() {

		const floatState = { offset: 0 };
		this.floatTween = this.scene.tweens.add({
			targets: floatState,
			offset: HelpHand.FLOAT_DISTANCE,
			duration: HelpHand.FLOAT_DURATION,
			yoyo: true,
			repeat: -1,
			ease: "Sine.InOut",
			onUpdate: () => {
				this.floatOffset = floatState.offset;
				this.y = this.restY + this.floatOffset;
			},
		});
	}

	showAt(x: number, y: number) {

		const nextRestX = x + HelpHand.POINT_OFFSET_X;
		const nextRestY = y + HelpHand.POINT_OFFSET_Y;
		const targetChanged = !this.isShown
			|| Math.hypot(this.restX - nextRestX, this.restY - nextRestY) > HelpHand.TARGET_CHANGE_THRESHOLD;

		if (!targetChanged) {
			return;
		}

		this.restX = nextRestX;
		this.restY = nextRestY;
		this.snapToRestPosition();
		this.revealAtTarget();
	}

	pointAt(x: number, y: number) {

		this.showAt(x, y);
	}

	isPointing() {

		return this.isShown;
	}

	private snapToRestPosition() {

		this.x = this.restX;
		this.y = this.restY + this.floatOffset;
		this.clickWaveGraphics?.setPosition(this.x, this.y);
	}

	private revealAtTarget() {

		this.isShown = true;
		this.setVisible(true);
		this.fadeTween?.stop();
		this.pulseTween?.stop();
		this.setScale(0.92);
		this.setAlpha(0);
		this.fadeTween = this.scene.tweens.add({
			targets: this,
			alpha: 1,
			scaleX: 1,
			scaleY: 1,
			duration: HelpHand.FADE_IN_DURATION,
			ease: "Back.Out",
		});
		this.playClickWave();
	}

	private playClickWave() {
		if (!this.clickWaveGraphics) {
			this.clickWaveGraphics = this.scene.add.graphics();
			this.clickWaveGraphics.setDepth(this.depth + 10);
		}

		this.clickWaveGraphics.clear();
		this.clickWaveGraphics.setPosition(this.x, this.y);
		this.clickWaveGraphics.setVisible(true);
		this.clickWaveTween?.stop();

		const waveState = { progress: 0 };
		this.clickWaveTween = this.scene.tweens.add({
			targets: waveState,
			progress: 1,
			duration: 680,
			ease: "Sine.Out",
			onUpdate: () => {
				this.clickWaveGraphics?.clear();
				for (let index = 0; index < 3; index++) {
					const localProgress = (waveState.progress + (index / 3)) % 1;
					const radius = 14 + (localProgress * 38);
					const alpha = Math.max(0, 1 - localProgress);
					this.clickWaveGraphics?.lineStyle(4, 0xFFFFFF, alpha);
					this.clickWaveGraphics?.strokeCircle(0, 0, radius);
				}
			},
			onComplete: () => {
				this.clickWaveGraphics?.clear();
				this.clickWaveGraphics?.setVisible(false);
			},
		});
	}

	show() {

		if (this.isShown) {
			return;
		}

		this.isShown = true;
		this.setVisible(true);
		this.fadeTween?.stop();
		this.fadeTween = this.scene.tweens.add({
			targets: this,
			alpha: 1,
			duration: HelpHand.FADE_IN_DURATION,
			ease: "Sine.Out",
		});
	}

	hide() {

		if (!this.isShown) {
			return;
		}

		this.isShown = false;
		this.fadeTween?.stop();
		this.pulseTween?.stop();
		this.fadeTween = this.scene.tweens.add({
			targets: this,
			alpha: 0,
			duration: HelpHand.FADE_OUT_DURATION,
			ease: "Sine.In",
			onComplete: () => {
				this.setVisible(false);
			},
		});
	}

	destroy(fromScene?: boolean) {

		this.floatTween?.stop();
		this.fadeTween?.stop();
		this.pulseTween?.stop();
		this.clickWaveTween?.stop();
		this.clickWaveGraphics?.destroy();
		super.destroy(fromScene);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here