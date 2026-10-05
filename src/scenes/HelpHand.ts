
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
	private static readonly INTRO_BOUNCE_SCALE = 2;
	private static readonly INTRO_GROW_DURATION = 420;
	private static readonly INTRO_SETTLE_DURATION = 320;
	private static readonly INTRO_HEARTBEAT_SCALE = 1.06;
	private static readonly INTRO_HEARTBEAT_DURATION = 420;
	private static readonly INTRO_MOVE_DURATION = 650;

	private restX = 0;
	private restY = 0;
	private floatOffset = 0;
	private isShown = false;
	private floatTween?: Phaser.Tweens.Tween;
	private fadeTween?: Phaser.Tweens.Tween;
	private pulseTween?: Phaser.Tweens.Tween;
	private introTween?: Phaser.Tweens.Tween;
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

	showAt(x: number, y: number, urgent = false) {

		const nextRestX = x + HelpHand.POINT_OFFSET_X;
		const nextRestY = y + HelpHand.POINT_OFFSET_Y;
		const targetChanged = !this.isShown
			|| Math.hypot(this.restX - nextRestX, this.restY - nextRestY) > HelpHand.TARGET_CHANGE_THRESHOLD;

		if (!targetChanged) {
			this.setUrgent(urgent);
			return;
		}

		this.restX = nextRestX;
		this.restY = nextRestY;
		this.snapToRestPosition();
		this.revealAtTarget(urgent);
	}

	pointAt(x: number, y: number) {

		this.showAt(x, y);
	}

	isPointing() {

		return this.isShown;
	}

	/**
	 * Intro de onboarding (día 1, primera vez): aparece en el centro de la pantalla
	 * con un crecimiento suave hasta escala 2 que se asienta de vuelta a la normalidad,
	 * y se queda "latiendo" ahí en loop hasta que se llama a `moveToPoint` (el caller
	 * decide cuándo, normalmente al confirmar el destino real al que debe apuntar).
	 */
	revealAtCenterWithBounce(centerX: number, centerY: number, onSettled?: () => void) {

		this.floatTween?.stop();
		this.fadeTween?.stop();
		this.pulseTween?.stop();
		this.introTween?.stop();
		this.pulseTween = undefined;

		this.isShown = true;
		this.setVisible(true);
		this.restX = centerX;
		this.restY = centerY;
		this.floatOffset = 0;
		this.x = centerX;
		this.y = centerY;
		this.setAlpha(0);
		this.setScale(0.4);

		this.fadeTween = this.scene.tweens.add({
			targets: this,
			alpha: 1,
			duration: HelpHand.FADE_IN_DURATION,
			ease: "Sine.Out",
		});

		this.introTween = this.scene.tweens.add({
			targets: this,
			scaleX: HelpHand.INTRO_BOUNCE_SCALE,
			scaleY: HelpHand.INTRO_BOUNCE_SCALE,
			duration: HelpHand.INTRO_GROW_DURATION,
			ease: "Sine.Out",
			onComplete: () => {
				this.introTween = this.scene.tweens.add({
					targets: this,
					scaleX: 1,
					scaleY: 1,
					duration: HelpHand.INTRO_SETTLE_DURATION,
					ease: "Sine.InOut",
					onComplete: () => {
						this.playIntroHeartbeat();
						onSettled?.();
					},
				});
			},
		});
	}

	/** Pulso suave e indefinido en el lugar; `moveToPoint` lo detiene cuando hay que avanzar. */
	private playIntroHeartbeat() {

		this.introTween = this.scene.tweens.add({
			targets: this,
			scaleX: HelpHand.INTRO_HEARTBEAT_SCALE,
			scaleY: HelpHand.INTRO_HEARTBEAT_SCALE,
			duration: HelpHand.INTRO_HEARTBEAT_DURATION,
			ease: "Sine.InOut",
			yoyo: true,
			repeat: -1,
		});
	}

	/** Desliza la mano en línea recta desde su posición actual hasta el punto indicado y retoma la flotación normal. */
	moveToPoint(targetX: number, targetY: number, onComplete?: () => void) {

		const nextRestX = targetX + HelpHand.POINT_OFFSET_X;
		const nextRestY = targetY + HelpHand.POINT_OFFSET_Y;
		const moveState = { x: this.x, y: this.restY };

		this.introTween?.stop();
		this.introTween = undefined;
		this.setScale(1);

		this.introTween = this.scene.tweens.add({
			targets: moveState,
			x: nextRestX,
			y: nextRestY,
			duration: HelpHand.INTRO_MOVE_DURATION,
			ease: "Sine.InOut",
			onUpdate: () => {
				this.x = moveState.x;
				this.y = moveState.y;
				this.restY = moveState.y;
			},
			onComplete: () => {
				this.restX = nextRestX;
				this.restY = nextRestY;
				this.startFloating();
				this.playClickWave();
				onComplete?.();
			},
		});
	}

	private snapToRestPosition() {

		this.x = this.restX;
		this.y = this.restY + this.floatOffset;
		this.clickWaveGraphics?.setPosition(this.x, this.y);
	}

	private revealAtTarget(urgent = false) {

		this.isShown = true;
		this.setVisible(true);
		this.fadeTween?.stop();
		this.pulseTween?.stop();
		this.pulseTween = undefined;
		this.setScale(0.92);
		this.setAlpha(0);
		this.fadeTween = this.scene.tweens.add({
			targets: this,
			alpha: 1,
			scaleX: 1,
			scaleY: 1,
			duration: HelpHand.FADE_IN_DURATION,
			ease: "Back.Out",
			onComplete: () => {
				this.setUrgent(urgent);
			},
		});
		this.playClickWave();
	}

	/** Activa/desactiva el titileo de alerta (cliente impaciente sin acción clara que señalar). */
	private setUrgent(urgent: boolean) {

		if (!urgent) {
			this.stopUrgentPulse();
			return;
		}

		if (this.pulseTween) {
			return;
		}

		this.setAlpha(1);
		this.pulseTween = this.scene.tweens.add({
			targets: this,
			alpha: { from: 1, to: 0.3 },
			duration: 220,
			yoyo: true,
			repeat: -1,
			ease: "Sine.InOut",
		});
	}

	private stopUrgentPulse() {

		if (!this.pulseTween) {
			return;
		}

		this.pulseTween.stop();
		this.pulseTween = undefined;

		if (this.isShown) {
			this.setAlpha(1);
		}
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
		this.pulseTween = undefined;
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
		this.introTween?.stop();
		this.clickWaveTween?.stop();
		this.clickWaveGraphics?.destroy();
		super.destroy(fromScene);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here