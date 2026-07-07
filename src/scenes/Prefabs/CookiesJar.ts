
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
import type Level from "../Level";
/* END-USER-IMPORTS */

export default class CookiesJar extends Phaser.GameObjects.Container {

	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? 0, y ?? 0);

		// jarImage
		const jarImage = scene.add.image(0, 0, "cookieJar");
		this.add(jarImage);

		this.jarImage = jarImage;

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

	/* START-USER-CODE */
	private static readonly HOVER_SCALE = 1.08;
	private static readonly PRESSED_SCALE = 0.94;
	private static readonly TWEEN_DURATION = 100;
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
	private badgeBackground?: Phaser.GameObjects.Graphics;
	private badgeText?: Phaser.GameObjects.Text;

	public setTexture(textureKey: string) {
		this.jarImage.setTexture(textureKey);
	}

	public setRemainingCookies(remaining: number) {

		const normalizedRemaining = Math.max(0, Math.floor(remaining));

		this.badgeText?.setText(String(normalizedRemaining));
		this.badgeBackground?.setVisible(true);
		this.badgeText?.setVisible(true);
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