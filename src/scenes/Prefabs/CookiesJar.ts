
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
import AlertPrefab from "./AlertPrefab";
import type Level from "../Level";
/* END-USER-IMPORTS */

export default class CookiesJar extends Phaser.GameObjects.Container {

	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? 0, y ?? 0);

		// jarImage
		const jarImage = scene.add.image(0, 0, "cookieJar");
		this.add(jarImage);

		// sandClock
		const sandClock = scene.add.image(0, -38, "sandClock");
		sandClock.setVisible(false);
		sandClock.setAlpha(0);
		this.add(sandClock);

		const alertMarker = new AlertPrefab(scene, 0, -82);
		alertMarker.setVisible(false);
		alertMarker.setAlpha(0);
		this.add(alertMarker);

		this.jarImage = jarImage;
		this.sandClock = sandClock;
		this.alertMarker = alertMarker;

		/* START-USER-CTR-CODE */
		this.baseScaleX = this.scaleX;
		this.baseScaleY = this.scaleY;
		this.createCookieCountBadge();
		this.setupInteraction();
		this.on(Phaser.Input.Events.POINTER_OVER, this.handlePointerOver, this);
		this.on(Phaser.Input.Events.POINTER_OUT, this.handlePointerOut, this);
		this.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
		/* END-USER-CTR-CODE */
	}

	private jarImage: Phaser.GameObjects.Image;
	public sandClock: Phaser.GameObjects.Image;
	private alertMarker: AlertPrefab;

	/* START-USER-CODE */
	private static readonly HOVER_SCALE = 1.08;
	private static readonly PRESSED_SCALE = 0.94;
	private static readonly TWEEN_DURATION = 100;
	private static readonly ATTENTION_PULSE_SCALE = 1.12;
	private static readonly ATTENTION_PULSE_DURATION = 520;
	private static readonly FILL_PULSE_SCALE = 1.22;
	private static readonly FILL_PULSE_DURATION = 160;
	private static readonly BADGE_OFFSET_X = 30;
	private static readonly BADGE_OFFSET_Y = -36;
	private static readonly BADGE_RADIUS = 20;
	private static readonly BADGE_FILL_COLOR = 0xFD7DB6;
	private static readonly BADGE_STROKE_COLOR = 0xffffff;
	private static readonly BADGE_STROKE_WIDTH = 3;
	private static readonly BADGE_TEXT_COLOR = "#ffffff";
	private static readonly BADGE_TEXT_STROKE = "#3E0307";

	private readonly baseScaleX: number;
	private readonly baseScaleY: number;
	private isPressed = false;
	private isAttentionPulsing = false;
	private isSandClockUrgent = false;
	private attentionPulseTween?: Phaser.Tweens.Tween;
	private sandClockPulseTween?: Phaser.Tweens.Tween;
	private sandClockSpinTween?: Phaser.Tweens.Tween;
	private badgeBackground?: Phaser.GameObjects.Graphics;
	private badgeText?: Phaser.GameObjects.Text;

	public setTexture(textureKey: string) {
		if (!this.jarImage || !this.scene || !this.scene.sys?.isActive()) {
			return;
		}

		this.jarImage.setTexture(textureKey);
	}

	public setRemainingCookies(remaining: number) {
		if (!this.badgeText || !this.badgeBackground || !this.scene || !this.scene.sys?.isActive()) {
			return;
		}

		const normalizedRemaining = Math.max(0, Math.floor(remaining));

		this.badgeText.setText(String(normalizedRemaining));
		this.badgeBackground.setVisible(true);
		this.badgeText.setVisible(true);
	}

	/**
	 * Hace latir el tarro para invitar a usarlo cuando un cliente necesita galleta.
	 * Anima la imagen interna para no interferir con hover/press del contenedor.
	 */
	public setAttentionPulse(active: boolean) {
		if (active) {
			this.startAttentionPulse();
			return;
		}

		this.stopAttentionPulse();
	}

	private startAttentionPulse() {
		if (this.isAttentionPulsing) {
			return;
		}

		this.isAttentionPulsing = true;
		this.attentionPulseTween?.stop();
		this.jarImage.setScale(1);

		this.attentionPulseTween = this.scene.tweens.add({
			targets: this.jarImage,
			scaleX: CookiesJar.ATTENTION_PULSE_SCALE,
			scaleY: CookiesJar.ATTENTION_PULSE_SCALE,
			duration: CookiesJar.ATTENTION_PULSE_DURATION,
			yoyo: true,
			repeat: -1,
			ease: "Sine.InOut",
		});
	}

	private stopAttentionPulse() {
		if (!this.isAttentionPulsing && !this.attentionPulseTween) {
			return;
		}

		this.isAttentionPulsing = false;
		this.attentionPulseTween?.stop();
		this.attentionPulseTween = undefined;
		this.jarImage.setScale(1);
	}

	public setSandClockUrgent(active: boolean) {
		if (active) {
			this.startSandClockUrgent();
			this.alertMarker.updateBurnProgress(1);
			return;
		}

		this.stopSandClockUrgent();
		this.alertMarker.updateBurnProgress(0);
	}

	private startSandClockUrgent() {
		if (this.isSandClockUrgent) {
			return;
		}

		this.isSandClockUrgent = true;
		this.sandClock.setVisible(true);
		this.sandClock.setAlpha(1);
		this.scene.tweens.killTweensOf(this.sandClock);

		this.sandClockSpinTween = this.scene.tweens.add({
			targets: this.sandClock,
			rotation: { from: 0, to: Math.PI * 2 },
			duration: 1100,
			repeat: -1,
			ease: "Linear",
		});

		this.sandClockPulseTween = this.scene.tweens.add({
			targets: this.sandClock,
			scaleX: { from: 1, to: 1.15 },
			scaleY: { from: 1, to: 1.15 },
			duration: 280,
			yoyo: true,
			repeat: -1,
			ease: "Sine.InOut",
		});
	}

	private stopSandClockUrgent() {
		if (!this.isSandClockUrgent && !this.sandClockSpinTween && !this.sandClockPulseTween) {
			return;
		}

		this.isSandClockUrgent = false;
		this.scene.tweens.killTweensOf(this.sandClock);
		this.sandClock.setRotation(0);
		this.sandClock.setScale(1);
		this.sandClock.setVisible(false);
		this.sandClock.setAlpha(0);
		this.sandClockSpinTween = undefined;
		this.sandClockPulseTween = undefined;
	}

	/**
	 * Pulso corto al recibir una galleta (estela de like).
	 * Pausa el latido de atención y lo reanuda si seguía activo.
	 */
	public playFillPulse(onComplete?: () => void) {
		const resumeAttention = this.isAttentionPulsing;
		this.stopAttentionPulse();
		this.scene.tweens.killTweensOf(this.jarImage);
		this.jarImage.setScale(1);

		this.scene.tweens.add({
			targets: this.jarImage,
			scaleX: CookiesJar.FILL_PULSE_SCALE,
			scaleY: CookiesJar.FILL_PULSE_SCALE,
			duration: CookiesJar.FILL_PULSE_DURATION,
			yoyo: true,
			ease: "Back.Out",
			onComplete: () => {
				if (this.jarImage.active) {
					this.jarImage.setScale(1);
				}

				if (resumeAttention) {
					this.startAttentionPulse();
				}

				onComplete?.();
			},
		});
	}

	private createCookieCountBadge() {

		const badgeContainer = this.scene.add.container(
			CookiesJar.BADGE_OFFSET_X,
			CookiesJar.BADGE_OFFSET_Y
		);
		const badgeBackground = this.scene.add.graphics();
		this.drawBadgeCircle(badgeBackground);
		badgeContainer.add(badgeBackground);

		const badgeText = this.scene.add.text(0, 0, "0", {
			color: CookiesJar.BADGE_TEXT_COLOR,
			fontFamily: "Klop",
			fontSize: "24px",
			fontStyle: "bold",
			stroke: CookiesJar.BADGE_TEXT_STROKE,
			strokeThickness: 3,
		});
		badgeText.setOrigin(0.5);
		badgeContainer.add(badgeText);
		this.add(badgeContainer);

		this.badgeBackground = badgeBackground;
		this.badgeText = badgeText;
	}

	private drawBadgeCircle(graphics: Phaser.GameObjects.Graphics) {

		graphics.clear();
		graphics.fillStyle(CookiesJar.BADGE_FILL_COLOR, 1);
		graphics.fillCircle(0, 0, CookiesJar.BADGE_RADIUS);
		graphics.lineStyle(CookiesJar.BADGE_STROKE_WIDTH, CookiesJar.BADGE_STROKE_COLOR, 1);
		graphics.strokeCircle(0, 0, CookiesJar.BADGE_RADIUS);
	}

	private setupInteraction() {

		const hitWidth = this.jarImage.width;
		const hitHeight = this.jarImage.height;

		this.setInteractive(
			new Phaser.Geom.Rectangle(-hitWidth * 0.5, -hitHeight * 0.5, hitWidth, hitHeight),
			Phaser.Geom.Rectangle.Contains
		);

		if (this.input) {
			this.input.cursor = "pointer";
		}
	}

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
			if (this.scene && this.scene.sys?.isActive() && this.scene.sound) {
				this.scene.sound.play("deny");
			}
			return;
		}

		this.isPressed = true;
		if (this.scene && this.scene.sys?.isActive() && this.scene.sound) {
			this.scene.sound.play("pop3");
		}
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