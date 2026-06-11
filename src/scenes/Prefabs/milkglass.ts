
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
import type Level from "../Level";
import type { MilkSlotId } from "./milkMachine";
/* END-USER-IMPORTS */

export default class milkglass extends Phaser.GameObjects.Image {

	constructor(scene: Phaser.Scene, x?: number, y?: number, texture?: string, frame?: number | string) {
		super(scene, x ?? 0, y ?? 0, texture || "GlassAnim", frame ?? "Vaso0001.png");

		/* START-USER-CTR-CODE */
		this.baseScaleX = this.scaleX;
		this.baseScaleY = this.scaleY;
		this.baseX = this.x;
		this.baseY = this.y;
		this.baseAngle = this.angle;
		this.setScale(0, 0);
		this.setInteractive({
			hitArea: new Phaser.Geom.Circle(
				this.displayOriginX,
				this.displayOriginY,
				Math.max(this.width, this.height) * milkglass.HIT_AREA_SCALE * 0.5
			),
			hitAreaCallback: Phaser.Geom.Circle.Contains,
			useHandCursor: true
		});
		this.on(Phaser.Input.Events.POINTER_OVER, this.handlePointerOver, this);
		this.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
		this.playSpawnTween();
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	private static readonly RAISED_OFFSET_Y = 50;
	private static readonly HOLDER_ACTIVE_DURATION = 100;
	private static readonly SPIN_ANGLE = 360;
	private static readonly HIT_AREA_SCALE = 1.5;
	private static readonly FILLED_FRAME = "Vaso0089.png";
	private static readonly MACHINE_SELECTION_SCALE = 1.2;
	private static readonly SELECTION_TIMEOUT = 2500;
	private readonly baseScaleX: number;
	private readonly baseScaleY: number;
	private readonly baseX: number;
	private readonly baseY: number;
	private readonly baseAngle: number;

	private isLaunching = false;
	private isRaised = false;
	private isAtMachine = false;
	private isReadyForDelivery = false;
	private isSelectingDelivery = false;
	private activeTimer?: Phaser.Time.TimerEvent;
	private danceTween?: Phaser.Tweens.Tween;
	private selectionTimeout?: Phaser.Time.TimerEvent;
	private currentSlotId?: MilkSlotId;

	private handlePointerOver() {
		if (this.isLaunching || this.isRaised || this.isSelectingDelivery) {
			return;
		}

		this.playPopTween();
	}

	private handlePointerDown() {
		if (this.isLaunching || this.isRaised || this.isSelectingDelivery) {
			return;
		}

		const levelScene = this.scene as Level;

		if (this.isAtMachine && this.isReadyForDelivery) {
			const directDeliveryTarget = levelScene.getDirectDeliveryTarget(this);

			if (directDeliveryTarget) {
				this.directDeliverToClient(directDeliveryTarget);
				return;
			}

			this.startDeliverySelection();
			return;
		}

		this.isLaunching = true;
		this.playPopTween(() => {
			this.raiseGlass();
		});
	}

	private raiseGlass() {

		this.clearActiveState();
		this.scene.tweens.add({
			targets: this,
			y: this.baseY - milkglass.RAISED_OFFSET_Y,
			angle: this.baseAngle + milkglass.SPIN_ANGLE,
			duration: 360,
			ease: "Cubic.Out",
			onComplete: () => {
				this.isRaised = true;
				this.isLaunching = false;
				this.angle = this.baseAngle;
				this.startActiveState();
			}
		});
	}

	private returnToBase() {

		this.clearActiveState();
		this.scene.tweens.add({
			targets: this,
			y: this.baseY,
			angle: this.baseAngle - milkglass.SPIN_ANGLE,
			duration: 360,
			ease: "Cubic.Out",
			onComplete: () => {
				this.isRaised = false;
				this.isLaunching = false;
				this.angle = this.baseAngle;
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

		this.activeTimer = this.scene.time.delayedCall(milkglass.HOLDER_ACTIVE_DURATION, () => {
			if (!this.isRaised || this.isLaunching) {
				return;
			}

			this.isLaunching = true;
			this.moveToMilkSlot();
		});
	}

	private moveToMilkSlot() {

		const levelScene = this.scene as Level;
		const targetSlot = levelScene.claimAvailableMilkSlot();

		if (!targetSlot) {
			this.returnToBase();
			return;
		}

		this.clearActiveState();
		this.currentSlotId = targetSlot.id;
		const replacementGlass = new milkglass(this.scene, this.baseX, this.baseY, this.texture.key, this.frame.name);
		this.scene.add.existing(replacementGlass);
		levelScene.registerHolderProductReplacement(this, replacementGlass);
		this.playSwooshSound();

		this.scene.tweens.add({
			targets: this,
			x: targetSlot.target.x,
			y: targetSlot.target.y,
			angle: this.baseAngle + milkglass.SPIN_ANGLE,
			duration: 420,
			ease: "Cubic.InOut",
			onComplete: () => {
				this.isRaised = false;
				this.isLaunching = false;
				this.angle = this.baseAngle;
				this.completeMilkRefill(targetSlot.id);
			}
		});
	}

	private completeMilkRefill(slotId: MilkSlotId) {

		const levelScene = this.scene as Level;
		this.currentSlotId = slotId;
		this.disableInteractive();
		this.setVisible(false);
		levelScene.milkmachine.playMilkRefill(slotId, () => {
			if (!this.active) {
				return;
			}

			levelScene.milkmachine.clearSlot(slotId);
			this.setTexture("GlassAnim", milkglass.FILLED_FRAME);
			this.setVisible(true);
			this.setInteractive({
				hitArea: new Phaser.Geom.Circle(
					this.displayOriginX,
					this.displayOriginY,
					Math.max(this.width, this.height) * milkglass.HIT_AREA_SCALE * 0.5
				),
				hitAreaCallback: Phaser.Geom.Circle.Contains,
				useHandCursor: true
			});
			this.isAtMachine = true;
			this.isReadyForDelivery = true;
			this.isLaunching = false;
			this.isRaised = false;
		});
	}

	public canReceiveDirectDelivery() {

		return this.active
			&& this.isAtMachine
			&& this.isReadyForDelivery
			&& !this.isLaunching
			&& !this.isSelectingDelivery;
	}

	public directDeliverToClient(client: { x: number; y: number; matchesProduct(product: milkglass): boolean; canReceiveDelivery(): boolean; consumeRequestAndExit(showYum?: boolean): void; }) {

		if (!this.canReceiveDirectDelivery()) {
			return;
		}

		const levelScene = this.scene as Level;
		this.isAtMachine = false;
		this.isReadyForDelivery = false;
		this.isSelectingDelivery = true;
		levelScene.beginDeliverySelection(this);
		this.deliverToClient(client);
	}

	private startDeliverySelection() {

		const levelScene = this.scene as Level;
		this.isLaunching = true;
		this.isAtMachine = false;
		this.isReadyForDelivery = false;

		this.scene.tweens.add({
			targets: this,
			scaleX: this.baseScaleX * milkglass.MACHINE_SELECTION_SCALE,
			scaleY: this.baseScaleY * milkglass.MACHINE_SELECTION_SCALE,
			duration: 220,
			ease: "Cubic.Out",
			onComplete: () => {
				this.isLaunching = false;
				this.isSelectingDelivery = true;
				levelScene.beginDeliverySelection(this);
				this.startSelectionTimeout(() => {
					this.cancelDeliverySelection();
				});
			}
		});
	}

	public deliverToClient(client: { x: number; y: number; matchesProduct(product: milkglass): boolean; canReceiveDelivery(): boolean; consumeRequestAndExit(showYum?: boolean): void; }) {

		if (!this.isSelectingDelivery || !this.currentSlotId) {
			return;
		}

		const levelScene = this.scene as Level;
		this.clearSelectionTimeout();
		levelScene.clearDeliverySelection(this);
		levelScene.releaseMilkSlot(this.currentSlotId);
		this.currentSlotId = undefined;
		this.isSelectingDelivery = false;
		this.isLaunching = true;
		this.playSwooshSound();

		this.scene.tweens.add({
			targets: this,
			x: client.x,
			y: client.y,
			angle: this.baseAngle + milkglass.SPIN_ANGLE,
			duration: 360,
			ease: "Cubic.InOut",
			onComplete: () => {
				this.angle = this.baseAngle;

				if (!client.canReceiveDelivery()) {

					levelScene.showProductDiscardLossAt(client.x, client.y - 64);
					this.playCancelOrder();
					this.fallOffscreen();
					return;
				}

				if (client.matchesProduct(this)) {
					levelScene.showCoinsAt(client.x);
					client.consumeRequestAndExit(true);
					this.destroy();
					return;
				}

				levelScene.showProductDiscardLossAt(client.x, client.y - 64);
				client.consumeRequestAndExit();
				this.fallOffscreen();
			}
		});
	}

	private playCancelOrder() {
	
			const looseMoneySoundKey = "looseMoney";
			this.scene.sound.play(looseMoneySoundKey);
		}

	public cancelDeliverySelection() {

		if (!this.isSelectingDelivery || !this.currentSlotId) {
			return;
		}

		const levelScene = this.scene as Level;
		const slotTarget = levelScene.milkmachine.getSlotTarget(this.currentSlotId);

		this.clearSelectionTimeout();
		levelScene.clearDeliverySelection(this);
		this.isSelectingDelivery = false;
		this.isLaunching = true;

		this.scene.tweens.add({
			targets: this,
			x: slotTarget.x,
			y: slotTarget.y,
			scaleX: this.baseScaleX,
			scaleY: this.baseScaleY,
			duration: 220,
			ease: "Cubic.Out",
			onComplete: () => {
				this.isLaunching = false;
				this.isAtMachine = true;
				this.isReadyForDelivery = true;
			}
		});
	}

	public reactivateFromProgression() {

		if (!this.active || !this.scene) {
			return;
		}

		this.setInteractive({
			hitArea: new Phaser.Geom.Circle(
				this.displayOriginX,
				this.displayOriginY,
				Math.max(this.width, this.height) * milkglass.HIT_AREA_SCALE * 0.5
			),
			hitAreaCallback: Phaser.Geom.Circle.Contains,
			useHandCursor: true
		});

		if (this.scaleX < 0.01 && this.scaleY < 0.01) {
			this.playSpawnTween();
		}
	}

	public matchesAppearance(appearance: { key: string; frame?: string | number }) {

		if (this.texture.key !== appearance.key) {
			return false;
		}

		if (appearance.frame === undefined) {
			return true;
		}

		return this.frame.name === appearance.frame;
	}

	private startSelectionTimeout(onTimeout: () => void) {

		this.clearSelectionTimeout();
		this.selectionTimeout = this.scene.time.delayedCall(milkglass.SELECTION_TIMEOUT, onTimeout);
	}

	private clearSelectionTimeout() {

		this.selectionTimeout?.remove(false);
		this.selectionTimeout = undefined;
	}

	private fallOffscreen() {

		this.isAtMachine = false;
		this.isReadyForDelivery = false;
		this.isLaunching = true;

		this.scene.tweens.add({
			targets: this,
			y: this.scene.scale.height + this.height,
			angle: this.angle - milkglass.SPIN_ANGLE,
			alpha: 0.7,
			duration: 420,
			ease: "Cubic.In",
			onComplete: () => {
				this.destroy();
			}
		});
	}

	private clearActiveState() {

		this.activeTimer?.remove(false);
		this.activeTimer = undefined;
		this.danceTween?.stop();
		this.danceTween = undefined;
		this.angle = this.baseAngle;
	}

	private playSpawnTween() {

		this.scene.tweens.add({
			targets: this,
			scaleX: this.baseScaleX * 1.2,
			scaleY: this.baseScaleY * 1.2,
			duration: 120,
			ease: "Back.Out",
			onComplete: () => {
				this.scene.tweens.add({
					targets: this,
					scaleX: this.baseScaleX,
					scaleY: this.baseScaleY,
					duration: 80,
					ease: "Sine.Out"
				});
			}
		});
	}

	private playPopTween(onComplete?: () => void) {

		this.scene.tweens.killTweensOf(this);
		this.setScale(this.baseScaleX, this.baseScaleY);

		this.scene.tweens.add({
			targets: this,
			scaleX: this.baseScaleX * 1.2,
			scaleY: this.baseScaleY * 1.2,
			duration: 90,
			yoyo: true,
			ease: "Quad.Out",
			onComplete: () => {
				onComplete?.();
			}
		});
	}

	private playSwooshSound() {

		const swooshSoundKey = Phaser.Math.Between(0, 1) === 0 ? "swoosh" : "swoosh2";
		this.scene.sound.play(swooshSoundKey);
	}

	// Write your code here.

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
