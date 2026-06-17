
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
/* END-USER-IMPORTS */

export default class dayHolderPrefab extends Phaser.GameObjects.Container {

	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? 0, y ?? 0);

		// dayHolder
		const dayHolder = scene.add.image(0, 0, "dayHolder");
		dayHolder.scaleX = 0.63;
		dayHolder.scaleY = 0.63;
		this.add(dayHolder);

		// DayText
		const dayText = scene.add.text(0, -53, "", {});
		dayText.setOrigin(0.5, 0.5);
		dayText.text = "DAY";
		dayText.setStyle({ "color": "#DF3D7A", "fontFamily": "Klop", "fontSize": "36px" });
		this.add(dayText);

		// DayNumber
		const dayNumber = scene.add.text(0, -20, "", {});
		dayNumber.setOrigin(0.5, 0.5);
		dayNumber.text = "1";
		dayNumber.setStyle({ "color": "#A96625", "fontFamily": "Klop", "fontSize": "36px" });
		this.add(dayNumber);

		// smallStarHolder1
		const smallStarHolder1 = scene.add.image(-37, 22, "smallStarHolder");
		smallStarHolder1.scaleX = 0.63;
		smallStarHolder1.scaleY = 0.63;
		this.add(smallStarHolder1);

		// smallStarHolder2
		const smallStarHolder2 = scene.add.image(0, 22, "smallStarHolder");
		smallStarHolder2.scaleX = 0.63;
		smallStarHolder2.scaleY = 0.63;
		this.add(smallStarHolder2);

		// smallStarHolder3
		const smallStarHolder3 = scene.add.image(37, 22, "smallStarHolder");
		smallStarHolder3.scaleX = 0.63;
		smallStarHolder3.scaleY = 0.63;
		this.add(smallStarHolder3);

		this.dayHolder = dayHolder;
		this.dayNumber = dayNumber;
		this.smallStarHolder1 = smallStarHolder1;
		this.smallStarHolder2 = smallStarHolder2;
		this.smallStarHolder3 = smallStarHolder3;

		/* START-USER-CTR-CODE */
		this.starSlots = [smallStarHolder1, smallStarHolder2, smallStarHolder3];
		this.setEarnedStars(0);
		this.baseScaleX = this.scaleX;
		this.baseScaleY = this.scaleY;
		this.baseAngle = this.angle;
		this.baseY = this.y;
		dayHolder.setInteractive({ useHandCursor: true });
		dayHolder.on(Phaser.Input.Events.POINTER_OVER, this.handlePointerOver, this);
		dayHolder.on(Phaser.Input.Events.POINTER_OUT, this.handlePointerOut, this);
		dayHolder.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
		dayHolder.on(Phaser.Input.Events.POINTER_UP, this.handlePointerUp, this);
		/* END-USER-CTR-CODE */
	}

	private dayHolder: Phaser.GameObjects.Image;
	private dayNumber: Phaser.GameObjects.Text;
	private smallStarHolder1: Phaser.GameObjects.Image;
	private smallStarHolder2: Phaser.GameObjects.Image;
	private smallStarHolder3: Phaser.GameObjects.Image;

	/* START-USER-CODE */
	private static readonly MAX_STARS = 3;
	private readonly starSlots: Phaser.GameObjects.Image[];
	private static readonly HOVER_SCALE = 1.1;
	private static readonly HOVER_ROTATION_MIN = -6;
	private static readonly HOVER_ROTATION_MAX = 6;
	private static readonly HOVER_UP_OFFSET = 10;
	private static readonly PRESS_SCALE = 1.02;
	private static readonly PRESS_DOWN_OFFSET = 4;
	private static readonly PRESS_TWEEN_DURATION = 110;
	private static readonly LOCKED_ALPHA = 0.45;
	private readonly baseScaleX: number;
	private readonly baseScaleY: number;
	private readonly baseAngle: number;
	private readonly baseY: number;
	private hoverTween?: Phaser.Tweens.Tween;
	private settleTween?: Phaser.Tweens.Tween;
	private isHovering = false;
	private isUnlocked = true;
	private currentHoverRotation = 0;

	private handlePointerOver() {
		if (!this.isUnlocked) {
			return;
		}

		this.isHovering = true;
		this.currentHoverRotation = Phaser.Math.Between(dayHolderPrefab.HOVER_ROTATION_MIN, dayHolderPrefab.HOVER_ROTATION_MAX);
		this.animateToState(
			this.baseScaleX * dayHolderPrefab.HOVER_SCALE,
			this.baseScaleY * dayHolderPrefab.HOVER_SCALE,
			this.baseAngle + this.currentHoverRotation,
			this.baseY - dayHolderPrefab.HOVER_UP_OFFSET,
			420,
			"Back.Out"
		);
	}

	private handlePointerOut() {
		if (!this.isUnlocked) {
			return;
		}

		this.isHovering = false;
		this.animateToState(
			this.baseScaleX,
			this.baseScaleY,
			this.baseAngle,
			this.baseY,
			260,
			"Bounce.Out"
		);
	}

	private handlePointerDown() {
		if (!this.isUnlocked) {
			return;
		}

		this.animateToState(
			this.baseScaleX * dayHolderPrefab.PRESS_SCALE,
			this.baseScaleY * dayHolderPrefab.PRESS_SCALE,
			this.baseAngle + this.currentHoverRotation,
			this.baseY - dayHolderPrefab.PRESS_DOWN_OFFSET,
			dayHolderPrefab.PRESS_TWEEN_DURATION,
			"Quad.Out"
		);
	}

	private handlePointerUp() {
		if (!this.isUnlocked) {
			return;
		}

		if (!this.isHovering) {
			return;
		}

		this.animateToState(
			this.baseScaleX * dayHolderPrefab.HOVER_SCALE,
			this.baseScaleY * dayHolderPrefab.HOVER_SCALE,
			this.baseAngle + this.currentHoverRotation,
			this.baseY - dayHolderPrefab.HOVER_UP_OFFSET,
			180,
			"Back.Out"
		);
		this.emit("selected");
	}

	private animateToState(scaleX: number, scaleY: number, angle: number, y: number, duration: number, ease: string) {
		this.settleTween?.stop();
		this.hoverTween?.stop();

		this.hoverTween = this.scene.tweens.add({
			targets: this,
			scaleX,
			scaleY,
			angle,
			y,
			duration,
			ease
		});
	}

	public setDayNumber(value: number | string) {
		this.dayNumber.setText(String(value));
	}

	public setEarnedStars(earnedStars: number) {

		const normalizedStars = Phaser.Math.Clamp(Math.floor(earnedStars), 0, dayHolderPrefab.MAX_STARS);

		this.starSlots.forEach((starSlot, index) => {
			starSlot.setVisible(index < normalizedStars);
		});
	}

	public setUnlocked(unlocked: boolean) {
		this.isUnlocked = unlocked;
		this.isHovering = false;

		if (unlocked) {
			this.dayHolder.setInteractive({ useHandCursor: true });
			this.setAlpha(1);
		} else {
			this.dayHolder.disableInteractive();
			this.setAlpha(dayHolderPrefab.LOCKED_ALPHA);
		}

		this.animateToState(
			this.baseScaleX,
			this.baseScaleY,
			this.baseAngle,
			this.baseY,
			0,
			"Linear"
		);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
