
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
import type Level from "../Level";
import type milkglass from "./milkglass";
/* END-USER-IMPORTS */

export type FlavorType = "Green" | "Red";

export function getFlavorGlassTextureKey(flavorType: FlavorType) {
	return flavorType === "Red" ? "RedGlass" : "GreenGlass";
}

export function normalizeFlavorType(value: string): FlavorType {
	return value.trim().toLowerCase() === "red" ? "Red" : "Green";
}

export default class FlavorBottle extends Phaser.GameObjects.Image {

	constructor(scene: Phaser.Scene, x?: number, y?: number, texture?: string, frame?: number | string) {
		super(scene, x ?? 0, y ?? 0, texture || "glace2", frame);

		/* START-USER-CTR-CODE */
		this.baseX = this.x;
		this.baseY = this.y;
		this.baseAngle = this.angle;
		this.setInteractive({ useHandCursor: true });
		this.on(Phaser.Input.Events.POINTER_OVER, this.handlePointerOver, this);
		this.on(Phaser.Input.Events.POINTER_OUT, this.handlePointerOut, this);
		this.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
		/* END-USER-CTR-CODE */
	}

	public FlavorType: string = "Green";

	/* START-USER-CODE */
	private static readonly RAISED_OFFSET_Y = 30;
	private static readonly SELECTION_TIMEOUT = 2500;
	private static readonly HOVER_SCALE = 1.08;
	private static readonly PRESSED_SCALE = 0.95;
	private static readonly FLIGHT_DURATION = 280;
	private static readonly RETURN_DURATION = 320;
	private static readonly POUR_ANGLE_OFFSET = -90;
	private readonly baseX: number;
	private readonly baseY: number;
	private readonly baseAngle: number;

	private isLaunching = false;
	private isSelectingFlavor = false;
	private selectionTimeout?: Phaser.Time.TimerEvent;
	private danceTween?: Phaser.Tweens.Tween;

	private handlePointerOver() {
		if (this.isLaunching || this.isSelectingFlavor) {
			return;
		}

		this.setScale(FlavorBottle.HOVER_SCALE);
	}

	private handlePointerOut() {
		if (this.isLaunching || this.isSelectingFlavor) {
			return;
		}

		this.setScale(1);
	}

	private handlePointerDown() {
		if (this.isLaunching) {
			return;
		}

		const levelScene = this.scene as Level;

		if (this.isSelectingFlavor) {
			return;
		}

		const directGlass = levelScene.getDirectFlavorGlass(this);

		if (directGlass) {
			this.activate(() => {
				this.applyToGlass(directGlass);
			});
			return;
		}

		levelScene.beginFlavorSelection(this);
		this.activate();
	}

	private activate(onReady?: () => void) {
		this.clearSelectionTimeout();
		this.isLaunching = true;
		this.setScale(1);

		this.scene.tweens.add({
			targets: this,
			y: this.baseY - FlavorBottle.RAISED_OFFSET_Y,
			duration: 220,
			ease: "Cubic.Out",
			onComplete: () => {
				this.isLaunching = false;
				this.isSelectingFlavor = true;
				this.startActiveState();
				onReady?.();
			}
		});
	}

	private startActiveState() {
		this.danceTween = this.scene.tweens.add({
			targets: this,
			angle: { from: this.baseAngle - 8, to: this.baseAngle + 8 },
			duration: 220,
			yoyo: true,
			repeat: -1,
			ease: "Sine.InOut"
		});

		this.startSelectionTimeout(() => {
			this.cancelFlavorSelection();
		});
	}

	public applyToGlass(glass: milkglass) {
		if (!this.isSelectingFlavor || this.isLaunching) {
			return;
		}

		const levelScene = this.scene as Level;
		const flavorType = normalizeFlavorType(this.FlavorType);
		const targetX = glass.x;
		const targetY = glass.y;

		this.clearSelectionTimeout();
		this.clearActiveState();
		this.isSelectingFlavor = false;
		this.isLaunching = true;
		levelScene.clearFlavorSelection(this);
		this.playSwooshSound();

		this.scene.tweens.add({
			targets: this,
			x: targetX,
			y: targetY,
			angle: this.baseAngle + FlavorBottle.POUR_ANGLE_OFFSET,
			duration: FlavorBottle.FLIGHT_DURATION,
			ease: "Cubic.InOut",
			onComplete: () => {
				glass.applyFlavor(flavorType);
				this.returnToBase();
			}
		});
	}

	public cancelFlavorSelection() {
		if (!this.isSelectingFlavor && !this.isLaunching) {
			return;
		}

		const levelScene = this.scene as Level;
		this.clearSelectionTimeout();
		this.clearActiveState();
		this.isSelectingFlavor = false;
		levelScene.clearFlavorSelection(this);
		this.returnToBase();
	}

	private returnToBase() {
		this.scene.tweens.killTweensOf(this);
		this.isLaunching = true;

		this.scene.tweens.add({
			targets: this,
			x: this.baseX,
			y: this.baseY,
			angle: this.baseAngle,
			scaleX: 1,
			scaleY: 1,
			duration: FlavorBottle.RETURN_DURATION,
			ease: "Cubic.Out",
			onComplete: () => {
				this.isLaunching = false;
				this.angle = this.baseAngle;
				this.setScale(1);
			}
		});
	}

	private clearActiveState() {
		this.danceTween?.stop();
		this.danceTween = undefined;
		this.angle = this.baseAngle;
	}

	private startSelectionTimeout(onTimeout: () => void) {
		this.clearSelectionTimeout();
		this.selectionTimeout = this.scene.time.delayedCall(FlavorBottle.SELECTION_TIMEOUT, onTimeout);
	}

	private clearSelectionTimeout() {
		this.selectionTimeout?.remove(false);
		this.selectionTimeout = undefined;
	}

	private playSwooshSound() {
		const swooshSoundKey = Phaser.Math.Between(0, 1) === 0 ? "swoosh" : "swoosh2";
		this.scene.sound.play(swooshSoundKey);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here