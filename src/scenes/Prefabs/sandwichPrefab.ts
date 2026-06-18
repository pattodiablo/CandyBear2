
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
import type Level from "../Level";
import { getProductCoinReward } from "../productProgress";
import type { ToasterSlotId } from "./ToasterPrefab";
/* END-USER-IMPORTS */

export default class sandwichPrefab extends Phaser.GameObjects.Image {

	constructor(scene: Phaser.Scene, x?: number, y?: number, texture?: string, frame?: number | string) {
		super(scene, x ?? 0, y ?? 0, texture || "sandWichAnim", frame ?? "sandwich0001.png");

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
				Math.max(this.width, this.height) * sandwichPrefab.HIT_AREA_SCALE * 0.5
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
	private static readonly FILLED_FRAME = "sandwich0005.png";
	private static readonly MACHINE_SELECTION_SCALE = 1.2;
	private static readonly SELECTION_TIMEOUT = 2500;
	private static readonly BURN_DURATION = 6000;
	private static readonly BURN_START_DELAY = 2000;
	private static readonly BURN_TINT = Phaser.Display.Color.ValueToColor(0x5c4634);
	private static readonly READY_POP_PEAK_SCALE = 1.5;
	private static readonly READY_POP_RISE_DURATION = 240;
	private static readonly READY_POP_SETTLE_DURATION = 180;
	private readonly baseScaleX: number;
	private readonly baseScaleY: number;
	private readonly baseX: number;
	private readonly baseY: number;
	private readonly baseAngle: number;

	private isLaunching = false;
	private isRaised = false;
	private isAtToaster = false;
	private isReadyForDelivery = false;
	private isBurned = false;
	private isSelectingDelivery = false;
	private activeTimer?: Phaser.Time.TimerEvent;
	private danceTween?: Phaser.Tweens.Tween;
	private burnTween?: Phaser.Tweens.Tween;
	private selectionTimeout?: Phaser.Time.TimerEvent;
	private burnProgress = 0;
	private currentSlotId?: ToasterSlotId;

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

		if (this.isBurned && this.isAtToaster) {
			this.discardBurnedSandwich();
			return;
		}

		if (this.isAtToaster && this.isReadyForDelivery) {
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
			this.raiseSandwich();
		});
	}

	private raiseSandwich() {

		this.clearActiveState();
		this.scene.tweens.add({
			targets: this,
			y: this.baseY - sandwichPrefab.RAISED_OFFSET_Y,
			angle: this.baseAngle + sandwichPrefab.SPIN_ANGLE,
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
			angle: this.baseAngle - sandwichPrefab.SPIN_ANGLE,
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

		this.activeTimer = this.scene.time.delayedCall(sandwichPrefab.HOLDER_ACTIVE_DURATION, () => {
			if (!this.isRaised || this.isLaunching) {
				return;
			}

			this.isLaunching = true;
			this.moveToToaster();
		});
	}

	private moveToToaster() {

		const levelScene = this.scene as Level;
		const targetSlot = levelScene.claimAvailableToasterSlot();

		if (!targetSlot) {
			this.returnToBase();
			return;
		}

		this.clearActiveState();
		this.currentSlotId = targetSlot.id;
		const replacementSandwich = new sandwichPrefab(this.scene, this.baseX, this.baseY, this.texture.key, this.frame.name);
		this.scene.add.existing(replacementSandwich);
		levelScene.registerHolderProductReplacement(this, replacementSandwich);
		this.playSwooshSound();

		this.scene.tweens.add({
			targets: this,
			x: targetSlot.target.x,
			y: targetSlot.target.y,
			angle: this.baseAngle + sandwichPrefab.SPIN_ANGLE,
			duration: 420,
			ease: "Cubic.InOut",
			onComplete: () => {
				this.isRaised = false;
				this.isLaunching = false;
				this.angle = this.baseAngle;
				this.completeToasterRoast(targetSlot.id);
			}
		});
	}

	private completeToasterRoast(slotId: ToasterSlotId) {

		const levelScene = this.scene as Level;
		this.currentSlotId = slotId;
		this.disableInteractive();
		this.setVisible(false);
		levelScene.toaster.roastSandwich(() => {
			if (!this.active) {
				return;
			}

			this.setTexture("sandWichAnim", sandwichPrefab.FILLED_FRAME);
			this.setScale(0, 0);
			this.setVisible(true);
			this.setInteractive({
				hitArea: new Phaser.Geom.Circle(
					this.displayOriginX,
					this.displayOriginY,
					Math.max(this.width, this.height) * sandwichPrefab.HIT_AREA_SCALE * 0.5
				),
				hitAreaCallback: Phaser.Geom.Circle.Contains,
				useHandCursor: true
			});
			this.isAtToaster = true;
			this.isReadyForDelivery = true;
			this.isBurned = false;
			this.isLaunching = false;
			this.isRaised = false;
			this.clearTint();
			this.scene.sound.play(`pop${Phaser.Math.Between(1, 3)}`);
			this.startBurnCountdown();
			this.playReadyForDeliveryPop();
		});
	}

	private startBurnCountdown() {

		this.burnProgress = 0;
		this.burnTween?.stop();
		this.burnTween = this.scene.tweens.addCounter({
			from: 0,
			to: 100,
			duration: sandwichPrefab.BURN_DURATION,
			delay: sandwichPrefab.BURN_START_DELAY,
			ease: "Linear",
			onUpdate: (tween) => {
				this.burnProgress = (tween.getValue() ?? 0) / 100;
				this.updateBurnTint();
			},
			onComplete: () => {
				this.isBurned = true;
				this.isReadyForDelivery = false;
				this.burnProgress = 1;
				this.updateBurnTint();
			}
		});
	}

	private updateBurnTint() {

		const color = Phaser.Display.Color.Interpolate.ColorWithColor(
			Phaser.Display.Color.ValueToColor(0xffffff),
			sandwichPrefab.BURN_TINT,
			100,
			Math.round(this.burnProgress * 100)
		);

		this.setTint(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
	}

	private discardBurnedSandwich() {

		const levelScene = this.scene as Level;
		const slotId = this.currentSlotId;

		this.clearBurnState(true);
		this.isAtToaster = false;
		this.isReadyForDelivery = false;
		this.isBurned = false;
		this.isLaunching = true;

		if (slotId) {
			levelScene.releaseToasterSlot(slotId);
			this.currentSlotId = undefined;
		}

		levelScene.showProductDiscardLossAt(this.x, this.y);

		this.scene.tweens.add({
			targets: this,
			y: this.scene.scale.height + this.height,
			angle: this.angle - sandwichPrefab.SPIN_ANGLE,
			alpha: 0.7,
			duration: 420,
			ease: "Cubic.In",
			onComplete: () => {
				this.destroy();
			}
		});
	}

	public canReceiveDirectDelivery() {

		return this.active
			&& this.isAtToaster
			&& this.isReadyForDelivery
			&& !this.isBurned
			&& !this.isLaunching
			&& !this.isSelectingDelivery;
	}

	public directDeliverToClient(client: { x: number; y: number; matchesProduct(product: sandwichPrefab): boolean; canReceiveDelivery(): boolean; consumeRequestAndExit(showYum?: boolean): void; }) {

		if (!this.canReceiveDirectDelivery()) {
			return;
		}

		const levelScene = this.scene as Level;
		this.clearBurnState();
		this.isAtToaster = false;
		this.isReadyForDelivery = false;
		this.isSelectingDelivery = true;
		levelScene.beginDeliverySelection(this);
		this.deliverToClient(client);
	}

	private startDeliverySelection() {

		const levelScene = this.scene as Level;
		this.clearBurnState();
		this.isLaunching = true;
		this.isAtToaster = false;
		this.isReadyForDelivery = false;

		this.scene.tweens.add({
			targets: this,
			scaleX: this.baseScaleX * sandwichPrefab.MACHINE_SELECTION_SCALE,
			scaleY: this.baseScaleY * sandwichPrefab.MACHINE_SELECTION_SCALE,
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

	public deliverToClient(client: { x: number; y: number; matchesProduct(product: sandwichPrefab): boolean; canReceiveDelivery(): boolean; consumeRequestAndExit(showYum?: boolean): void; }) {

		if (!this.isSelectingDelivery || !this.currentSlotId) {
			return;
		}

		const levelScene = this.scene as Level;
		this.clearBurnState();
		this.clearSelectionTimeout();
		levelScene.clearDeliverySelection(this);
		levelScene.releaseToasterSlot(this.currentSlotId);
		this.currentSlotId = undefined;
		this.isSelectingDelivery = false;
		this.isLaunching = true;
		this.playSwooshSound();

		this.scene.tweens.add({
			targets: this,
			x: client.x,
			y: client.y,
			angle: this.baseAngle + sandwichPrefab.SPIN_ANGLE,
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
					levelScene.showCoinsAt(client.x, getProductCoinReward("holder3"));
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
		const slotTarget = levelScene.toaster.getSlotTarget(this.currentSlotId);

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
				this.isAtToaster = true;
				this.isReadyForDelivery = true;
				this.isBurned = false;
				this.clearTint();
				this.startBurnCountdown();
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
				Math.max(this.width, this.height) * sandwichPrefab.HIT_AREA_SCALE * 0.5
			),
			hitAreaCallback: Phaser.Geom.Circle.Contains,
			useHandCursor: true
		});

		if (this.scaleX < 0.01 && this.scaleY < 0.01) {
			this.playSpawnTween();
		}
	}

	public matchesAppearance(appearance: { key: string; frame?: string | number }) {

		if (this.isBurned) {
			return false;
		}

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
		this.selectionTimeout = this.scene.time.delayedCall(sandwichPrefab.SELECTION_TIMEOUT, onTimeout);
	}

	private clearSelectionTimeout() {

		this.selectionTimeout?.remove(false);
		this.selectionTimeout = undefined;
	}

	private fallOffscreen() {

		this.clearBurnState();
		this.isAtToaster = false;
		this.isReadyForDelivery = false;
		this.isBurned = false;
		this.isLaunching = true;

		this.scene.tweens.add({
			targets: this,
			y: this.scene.scale.height + this.height,
			angle: this.angle - sandwichPrefab.SPIN_ANGLE,
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

	private clearBurnState(keepTint = false) {

		this.burnTween?.stop();
		this.burnTween = undefined;
		this.burnProgress = 0;

		if (!keepTint) {
			this.clearTint();
		}
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

	private playReadyForDeliveryPop() {

		this.scene.tweens.killTweensOf(this);
		this.setScale(0, 0);

		this.scene.tweens.add({
			targets: this,
			scaleX: this.baseScaleX * sandwichPrefab.READY_POP_PEAK_SCALE,
			scaleY: this.baseScaleY * sandwichPrefab.READY_POP_PEAK_SCALE,
			duration: sandwichPrefab.READY_POP_RISE_DURATION,
			ease: "Back.Out",
			onComplete: () => {
				this.scene.tweens.add({
					targets: this,
					scaleX: this.baseScaleX,
					scaleY: this.baseScaleY,
					duration: sandwichPrefab.READY_POP_SETTLE_DURATION,
					ease: "Bounce.Out",
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

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here