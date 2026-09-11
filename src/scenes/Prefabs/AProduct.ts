
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
import type Level from "../Level";
import { getAdjustedFryDurationMs } from "../momentUpgradeBonuses";
import { getProductCoinReward, type ProductSlotId } from "../productProgress";
import AlertPrefab from "./AlertPrefab";
import ConfettiPrefab from "./ConfettiPrefab";
/* END-USER-IMPORTS */

export default class AProduct extends Phaser.GameObjects.Image {

	constructor(scene: Phaser.Scene, x?: number, y?: number, texture?: string, frame?: number | string) {
		super(scene, x ?? 0, y ?? 0, texture || "Product1Raw", frame);

		/* START-USER-CTR-CODE */
		this.baseScaleX = this.scaleX;
		this.baseScaleY = this.scaleY;
		this.baseX = this.x;
		this.baseY = this.y;
		this.baseAngle = this.angle;
		this.syncAppearanceSetWithInitialTexture(texture ?? this.texture.key);
		this.applyAppearance(this.Raw);
		this.setScale(0, 0);
		this.setInteractive({
			hitArea: new Phaser.Geom.Circle(
				this.displayOriginX,
				this.displayOriginY,
				Math.max(this.width, this.height) * AProduct.HIT_AREA_SCALE * 0.5
			),
			hitAreaCallback: Phaser.Geom.Circle.Contains,
			useHandCursor: true
		});
		this.on(Phaser.Input.Events.POINTER_OVER, this.handlePointerOver, this);
		this.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
		this.playSpawnTween();
		/* END-USER-CTR-CODE */
	}

	public ACTIVE_DURATION: number = 2500;
	public Raw: {key:string,frame?:string|number} = {"key":"Product1Raw"};
	public Cooked: {key:string,frame?:string|number} = {"key":"Product1Cooked"};
	public ChocolateDip: {key:string,frame?:string|number} = {"key":"Product1Chocolate"};
	public CandyDip: {key:string,frame?:string|number} = {"key":"Product1Candy"};

	/* START-USER-CODE */
	public fryDuration = 3000;
	private static readonly PRODUCT2_EXTRA_FRY_DURATION = 3000;
	private static readonly BURN_DURATION = 6000;
	private static readonly HOLDER_ACTIVE_DURATION = 100;
	private static readonly BURN_START_DELAY = 2000;
	private static readonly RAISED_OFFSET_Y = 70;
	private static readonly FRYER_OFFSET_Y = 20;
	private static readonly FRY_FLOAT_OFFSET_Y = 10;
	private static readonly SPIN_ANGLE = 360;
	private static readonly HIT_AREA_SCALE = 1.75;
	private static readonly WORKPLACE_DELAY = 200;
	private static readonly WORKPLACE_LIFT_OFFSET_Y = 35;
	private static readonly WORKPLACE_SELECTION_SCALE = 1.3;
	private static readonly DIP_SCALE_DURATION = 120;
	private static readonly SELECTION_TIMEOUT = 2500;
	private static readonly BURN_TINT = Phaser.Display.Color.ValueToColor(0x5c4634);
	private readonly baseScaleX: number;
	private readonly baseScaleY: number;
	private readonly baseX: number;
	private readonly baseY: number;
	private readonly baseAngle: number;

	private isLaunching = false;
	private isRaised = false;
	private isCooking = false;
	private isCooked = false;
	private isBurned = false;
	private isAtWorkplace = false;
	private isReadyForDelivery = false;
	private isSelectingDip = false;
	private isSelectingDelivery = false;
	private isDelivered = false;
	private activeTimer?: Phaser.Time.TimerEvent;
	private danceTween?: Phaser.Tweens.Tween;
	private fryTimer?: Phaser.Time.TimerEvent;
	private floatTween?: Phaser.Tweens.Tween;
	private burnTween?: Phaser.Tweens.Tween;
	private blockedMoveTween?: Phaser.Tweens.Tween;
	private lastBlockedMoveAt = 0;
	private isWaitingForWorkplaceRetry = false;
	private selectionTimeout?: Phaser.Time.TimerEvent;
	private workplaceRetryTimer?: Phaser.Time.TimerEvent;
	private burnProgress = 0;
	private burnAlert?: AlertPrefab;
	private currentFryerId?: "fryer1" | "fryer2";
	private currentWorkplaceId?: "workplace1" | "workplace2";
	private currentTrayId?: "charola1" | "charola2";
	private traySlotX?: number;
	private traySlotY?: number;

	private getProductSlotId(): ProductSlotId {
		return this.Raw.key.startsWith("Product2") ? "holder2" : "holder1";
	}

	public getCurrentWorkplaceId() {
		return this.currentWorkplaceId;
	}

	private syncAppearanceSetWithInitialTexture(textureKey: string) {

		const rawTextureMatch = textureKey.match(/^Product(\d+)Raw$/);

		if (!rawTextureMatch) {
			return;
		}

		const variantPrefix = `Product${rawTextureMatch[1]}`;
		this.Raw = { key: `${variantPrefix}Raw` };
		this.Cooked = { key: `${variantPrefix}Cooked` };
		this.ChocolateDip = { key: `${variantPrefix}Chocolate` };
		this.CandyDip = { key: `${variantPrefix}Candy` };

		if (rawTextureMatch[1] === "2") {
			this.fryDuration += AProduct.PRODUCT2_EXTRA_FRY_DURATION;
		}
	}

	private handlePointerOver() {
		if (!this.input || !this.input.enabled) {
			return;
		}

		if (this.isLaunching || this.isRaised || this.isCooking || this.isSelectingDip || this.isSelectingDelivery) {
			return;
		}

		this.playPopTween();
	}

	private handlePointerDown() {
		if (!this.input || !this.input.enabled) {
			return;
		}

		if (this.isLaunching || this.isRaised || this.isCooking || this.isSelectingDip || this.isSelectingDelivery) {
			return;
		}

		const levelScene = this.scene as Level;

		if (this.currentTrayId) {
			if (this.isReadyForDelivery) {
				const directDeliveryTarget = levelScene.getDirectDeliveryTarget(this);

				if (directDeliveryTarget) {
					this.directDeliverToClient(directDeliveryTarget);
					return;
				}

				this.startDeliverySelection();
			}

			return;
		}

		if (this.isAtWorkplace) {
			if (this.isReadyForDelivery) {
				const directDeliveryTarget = levelScene.getDirectDeliveryTarget(this);

				if (directDeliveryTarget) {
					this.directDeliverToClient(directDeliveryTarget);
					return;
				}

				// Sin cliente que lo pida: va a una bandeja con hueco (como sándwiches).
				if (levelScene.tryAutoPlaceOnAnyTray(this)) {
					return;
				}

				// Bandejas llenas: selección manual de entrega.
				this.startDeliverySelection();
				return;
			}

			this.startDipSelection();
			return;
		}

		if (this.isBurned) {
			this.discardBurnedProduct();
			return;
		}

		if (this.isCooked) {
			this.pickUpFromFryer();
			return;
		}

		this.isLaunching = true;
		this.playPopTween(() => {
			this.raiseProduct();
		});
	}

	private startDirectDelivery(client: { x: number; y: number; matchesProduct(product: AProduct): boolean; canReceiveDelivery(): boolean; receiveProductDelivery(product: AProduct): boolean; consumeRequestAndExit(): void; }) {

		this.isAtWorkplace = false;
		this.isReadyForDelivery = false;
		this.isSelectingDelivery = true;
		this.deliverToClient(client);
	}

	public reactivateFromProgression() {

		if (!this.active || !this.scene) {
			return;
		}

		this.setInteractive({
			hitArea: new Phaser.Geom.Circle(
				this.displayOriginX,
				this.displayOriginY,
				Math.max(this.width, this.height) * AProduct.HIT_AREA_SCALE * 0.5
			),
			hitAreaCallback: Phaser.Geom.Circle.Contains,
			useHandCursor: true
		});

		if (this.scaleX < 0.01 && this.scaleY < 0.01) {
			this.playSpawnTween();
		}
	}

	private getSafeScene(): Phaser.Scene | undefined {
		if (!this.active || !this.scene) {
			return undefined;
		}

		return this.scene;
	}

	public canReceiveDirectDelivery() {

		return this.active
			&& (this.isAtWorkplace || !!this.currentTrayId)
			&& this.isReadyForDelivery
			&& !this.isLaunching
			&& !this.isSelectingDip
			&& !this.isSelectingDelivery;
	}

	public recoverFromStaleTrayState(trayId?: "charola1" | "charola2", targetX?: number, targetY?: number) {
		if (!this.active || !this.scene) {
			return;
		}

		this.setPointerInteractionEnabled(true);
		this.clearSelectionTimeout();
		this.isLaunching = false;
		this.isSelectingDelivery = false;
		this.isReadyForDelivery = true;
		this.isAtWorkplace = false;
		this.isBurned = false;
		this.clearBurnState();

		if (trayId) {
			this.currentTrayId = trayId;
			if (targetX !== undefined) {
				this.traySlotX = targetX;
			}
			if (targetY !== undefined) {
				this.traySlotY = targetY;
			}
			if (this.traySlotX !== undefined && this.traySlotY !== undefined) {
				this.setPosition(this.traySlotX, this.traySlotY);
			}
		} else {
			this.currentTrayId = undefined;
			this.traySlotX = undefined;
			this.traySlotY = undefined;
		}

		this.resetScaleToBase();
	}

	public isOnTray() {

		return !!this.currentTrayId;
	}

	public isIdleOnHolder() {

		return this.active
			&& this.visible
			&& this.scaleX > 0.01
			&& !this.isLaunching
			&& !this.isRaised
			&& !this.isCooking
			&& !this.isCooked
			&& !this.isBurned
			&& !this.isAtWorkplace
			&& !this.currentTrayId
			&& !this.isSelectingDip
			&& !this.isSelectingDelivery
			&& !this.isReadyForDelivery;
	}

	public isRaisedOnHolder() {

		return this.active && this.isRaised && !this.isCooking && !this.isCooked && !this.isBurned;
	}

	public isInProductionPipeline() {

		return this.active
			&& this.visible
			&& this.scaleX > 0.01
			&& (
				this.isRaised
				|| this.isLaunching
				|| this.isCooking
				|| this.isCooked
				|| this.isBurned
				|| this.isAtWorkplace
				|| !!this.currentTrayId
				|| this.isSelectingDip
				|| this.isSelectingDelivery
				|| this.isReadyForDelivery
			);
	}

	public isAwaitingFryerPickup() {

		return this.active && (this.isCooked || this.isBurned);
	}

	public isBurnedProduct() {

		return this.isBurned;
	}

	public isCurrentlyFrying() {

		return this.isCooking;
	}

	public isChoosingDip() {

		return this.isSelectingDip;
	}

	public isChoosingDelivery() {

		return this.isSelectingDelivery;
	}

	public isInMotion() {

		return this.isLaunching;
	}

	public isTransferringToWorkplace() {

		return this.isLaunching && !!this.currentWorkplaceId && !this.isAtWorkplace;
	}

	public directDeliverToClient(client: { x: number; y: number; matchesProduct(product: AProduct): boolean; canReceiveDelivery(): boolean; receiveProductDelivery(product: AProduct): boolean; consumeRequestAndExit(): void; }) {

		if (!this.canReceiveDirectDelivery()) {
			return;
		}

		const levelScene = this.scene as Level;
		this.isAtWorkplace = false;
		this.isReadyForDelivery = false;
		this.isSelectingDelivery = true;
		levelScene.beginDeliverySelection(this);
		this.deliverToClient(client);
	}

	public canAutoPlaceInTray() {

		return this.active
			&& this.isAtWorkplace
			&& this.isReadyForDelivery
			&& !this.isLaunching
			&& !this.isSelectingDip
			&& !this.isSelectingDelivery;
	}

	public autoPlaceInTray(trayId: "charola1" | "charola2", targetX: number, targetY: number) {

		if (!this.canAutoPlaceInTray()) {
			return;
		}

		const levelScene = this.scene as Level;
		this.isAtWorkplace = false;
		this.isReadyForDelivery = false;
		this.isLaunching = true;
		this.currentTrayId = trayId;
		this.traySlotX = targetX;
		this.traySlotY = targetY;
		levelScene.releaseWorkplace(this.currentWorkplaceId);
		this.currentWorkplaceId = undefined;
		this.playSwooshSound();
		this.resetScaleToBase();

		this.scene.tweens.add({
			targets: this,
			x: targetX,
			y: targetY,
			scaleX: this.baseScaleX,
			scaleY: this.baseScaleY,
			duration: 320,
			ease: "Cubic.InOut",
			onComplete: () => {
				this.resetScaleToBase();
				this.isLaunching = false;
				this.isReadyForDelivery = true;
				levelScene.reserveTraySlot(trayId, this);
			}
		});
	}

	private setPointerInteractionEnabled(enabled: boolean) {
		if (this.input) {
			this.input.enabled = enabled;
		}
	}

	private raiseProduct() {

		const scene = this.getSafeScene();
		if (!scene) {
			return;
		}

		this.setPointerInteractionEnabled(false);
		this.clearActiveState();
		scene.tweens.add({
			targets: this,
			y: this.baseY - AProduct.RAISED_OFFSET_Y,
			angle: this.baseAngle + AProduct.SPIN_ANGLE,
			duration: 360,
			ease: "Cubic.Out",
			onComplete: () => {
				if (!this.active || !this.scene) {
					return;
				}
				this.isRaised = true;
				this.isLaunching = false;
				this.angle = this.baseAngle;
				this.startActiveState();
			}
		});
	}

	private returnToBase() {

		const scene = this.getSafeScene();
		if (!scene) {
			return;
		}

		this.setPointerInteractionEnabled(false);
		this.clearActiveState();
		scene.tweens.add({
			targets: this,
			y: this.baseY,
			angle: this.baseAngle - AProduct.SPIN_ANGLE,
			duration: 360,
			ease: "Cubic.Out",
			onComplete: () => {
				if (!this.active || !this.scene) {
					return;
				}
				this.isRaised = false;
				this.isLaunching = false;
				this.angle = this.baseAngle;
				this.setPointerInteractionEnabled(true);
			}
		});
	}

	private startActiveState() {

		const scene = this.getSafeScene();
		if (!scene) {
			return;
		}

		this.danceTween = scene.tweens.add({
			targets: this,
			angle: { from: this.baseAngle - 8, to: this.baseAngle + 8 },
			duration: 220,
			yoyo: true,
			repeat: -1,
			ease: "Sine.InOut"
		});

		this.activeTimer = scene.time.delayedCall(AProduct.HOLDER_ACTIVE_DURATION, () => {
			if (!this.active || !this.scene || !this.isRaised || this.isLaunching) {
				return;
			}

			this.isLaunching = true;
			this.moveToFryer();
		});
	}

	private playBlockedMoveFeedback() {
		const scene = this.getSafeScene();
		if (!scene || !this.active) {
			return;
		}

		if (scene.time.now - this.lastBlockedMoveAt < 220) {
			return;
		}

		this.lastBlockedMoveAt = scene.time.now;
		const originalX = this.x;
		this.blockedMoveTween?.stop();
		this.blockedMoveTween = scene.tweens.add({
			targets: this,
			x: { from: originalX - 8, to: originalX + 8 },
			duration: 90,
			repeat: 0,
			ease: "Sine.InOut",
			onComplete: () => {
				this.x = originalX;
				this.blockedMoveTween = undefined;
			}
		});
	}

	private moveToFryer() {

		const scene = this.getSafeScene();
		if (!scene) {
			return;
		}

		const levelScene = scene as Level;
		const targetFryer = levelScene.claimAvailableFryer();

		if (!targetFryer) {
			this.playBlockedMoveFeedback();
			this.returnToBase();
			return;
		}

		this.clearActiveState();
		this.setPointerInteractionEnabled(false);
		this.isRaised = false;
		this.isLaunching = true;
		this.isReadyForDelivery = false;
		this.isAtWorkplace = false;
		const replacementProduct = new AProduct(scene, this.baseX, this.baseY, this.Raw.key, this.Raw.frame);
		replacementProduct.Raw = { ...this.Raw };
		replacementProduct.Cooked = { ...this.Cooked };
		replacementProduct.ChocolateDip = { ...this.ChocolateDip };
		replacementProduct.CandyDip = { ...this.CandyDip };
		replacementProduct.fryDuration = this.fryDuration;
		scene.add.existing(replacementProduct);
		levelScene.registerHolderProductReplacement(this, replacementProduct);
		this.playSwooshSound();
		scene.tweens.add({
			targets: this,
			x: targetFryer.target.x,
			y: targetFryer.target.y - AProduct.FRYER_OFFSET_Y,
			angle: this.baseAngle + AProduct.SPIN_ANGLE,
			duration: 220,
			ease: "Cubic.InOut",
			onComplete: () => {
				this.isRaised = false;
				this.isLaunching = false;
				this.currentFryerId = targetFryer.id;
				this.angle = this.baseAngle;
				this.setPointerInteractionEnabled(true);
				this.startFrying(targetFryer.target.y - AProduct.FRYER_OFFSET_Y);
			}
		});
	}

	private startFrying(fryerY: number) {

		const scene = this.getSafeScene();
		if (!scene) {
			return;
		}

		const levelScene = scene as Level;

		this.isCooking = true;
		this.isCooked = false;

		if (this.currentFryerId) {
			levelScene.playFryerAnimation(this.currentFryerId, getAdjustedFryDurationMs(this.fryDuration));
		}

		scene.sound.play(["fry", "fry2", "fry3"][Phaser.Math.Between(0, 2)]);
		this.floatTween = scene.tweens.add({
			targets: this,
			y: fryerY - AProduct.FRY_FLOAT_OFFSET_Y,
			duration: 350,
			yoyo: true,
			repeat: -1,
			ease: "Sine.InOut"
		});

		this.fryTimer = scene.time.delayedCall(getAdjustedFryDurationMs(this.fryDuration), () => {
			if (!this.active || !this.scene) {
				return;
			}
			this.finishFrying(fryerY);
		});
	}

	private finishFrying(fryerY: number) {

		if (!this.active || !this.scene) {
			return;
		}

		const levelScene = this.scene as Level;

		if (this.currentFryerId) {
			levelScene.resetFryerAppearance(this.currentFryerId);
		}

		this.clearFryingState();
		this.y = fryerY;
		this.isCooking = false;
		this.isCooked = true;
		this.isBurned = false;
		this.isReadyForDelivery = false;
		this.setPointerInteractionEnabled(true);
		this.applyAppearance(this.Cooked);
		this.clearTint();
		this.scene.sound.play(`pop${Phaser.Math.Between(1, 3)}`);
		this.startBurnCountdown();
		this.playPopTween();
	}

	private startBurnCountdown() {
		this.ensureBurnAlert();
		this.burnProgress = 0;
		this.burnAlert?.updateBurnProgress(this.burnProgress);
		this.burnTween?.stop();
		this.burnTween = this.scene.tweens.addCounter({
			from: 0,
			to: 100,
			duration: AProduct.BURN_DURATION,
			delay: AProduct.BURN_START_DELAY,
			ease: "Linear",
			onUpdate: (tween) => {
				this.burnProgress = (tween.getValue() ?? 0) / 100;
				this.updateBurnTint();
			},
			onComplete: () => {
				this.isBurned = true;
				this.burnProgress = 1;
				this.updateBurnTint();
			}
		});
	}

	private ensureBurnAlert() {
		if (this.burnAlert) {
			this.burnAlert.setVisible(true);
			return;
		}

		const alert = new AlertPrefab(this.scene, this.x, this.y - this.height * 0.85);
		alert.setDepth(this.depth + 10);
		this.scene.add.existing(alert);
		this.burnAlert = alert;
		this.on(Phaser.GameObjects.Events.DESTROY, () => {
			this.burnAlert?.destroy();
		});
	}

	private updateBurnTint() {
		if (this.burnProgress >= 0.98 || this.isBurned) {
			this.setTint(0xff4a4a);
		} else {
			const color = Phaser.Display.Color.Interpolate.ColorWithColor(
				Phaser.Display.Color.ValueToColor(0xffffff),
				AProduct.BURN_TINT,
				100,
				Math.round(this.burnProgress * 100)
			);

			this.setTint(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
		}

		if (this.burnAlert) {
			this.burnAlert.setPosition(this.x, this.y - Math.max(this.displayHeight, 26) * 0.7);
			this.burnAlert.setDepth(this.depth + 10);
			this.burnAlert.updateBurnProgress(this.burnProgress);
		}
	}

	private pickUpFromFryer() {
		if (!this.active || !this.scene) {
			return;
		}

		const levelScene = this.scene as Level;
		const workplace = levelScene.claimAvailableWorkplace();

		if (!workplace) {
			if (!this.isWaitingForWorkplaceRetry) {
				this.isWaitingForWorkplaceRetry = true;
				this.playBlockedMoveFeedback();
			}
			this.queueWorkplaceTransferRetry();
			return;
		}

		this.setPointerInteractionEnabled(false);
		this.clearWorkplaceTransferRetry();
		this.isWaitingForWorkplaceRetry = false;
		this.clearBurnState();
		levelScene.releaseFryer(this.currentFryerId);
		this.currentFryerId = undefined;
		this.currentWorkplaceId = workplace.id;
		this.isLaunching = true;
		this.isCooked = false;
		this.isReadyForDelivery = false;
		this.playSwooshSound();

		this.scene.tweens.add({
			targets: this,
			y: this.y - AProduct.WORKPLACE_LIFT_OFFSET_Y,
			duration: 180,
			ease: "Cubic.Out",
			onComplete: () => {
				const activeScene = this.getSafeScene();
				if (!activeScene || !this.active || !this.scene) {
					return;
				}
				activeScene.time.delayedCall(AProduct.WORKPLACE_DELAY, () => {
					if (!this.active || !this.scene) {
						return;
					}
					this.moveToWorkplace(workplace.target);
				});
			}
		});
	}

	private discardBurnedProduct() {

		if (!this.active || !this.scene) {
			return;
		}

		const levelScene = this.scene as Level;
		this.clearWorkplaceTransferRetry();
		this.clearBurnState(true);
		levelScene.releaseFryer(this.currentFryerId);
		this.currentFryerId = undefined;
		this.isCooked = false;
		this.isBurned = false;
		this.isLaunching = true;
		levelScene.showProductDiscardLossAt(this.x, this.y);

		this.scene.tweens.add({
			targets: this,
			y: this.scene.scale.height + this.height,
			angle: this.angle - AProduct.SPIN_ANGLE,
			alpha: 0.7,
			duration: 420,
			ease: "Cubic.In",
			onComplete: () => {
				this.destroy();
			}
		});
	}

	private moveToWorkplace(workplace: Phaser.GameObjects.Image) {

		const scene = this.getSafeScene();
		if (!scene) {
			return;
		}

		scene.tweens.add({
			targets: this,
			x: workplace.x,
			y: workplace.y,
			duration: 360,
			ease: "Cubic.InOut",
			onComplete: () => {
				if (!this.active || !this.scene) {
					return;
				}
				this.isLaunching = false;
				this.isAtWorkplace = true;
				this.isReadyForDelivery = false;
				this.isDelivered = true;
			}
		});
	}

	private startDipSelection() {

		const scene = this.getSafeScene();
		if (!scene) {
			return;
		}

		const levelScene = scene as Level;
		this.setPointerInteractionEnabled(false);
		this.isLaunching = true;
		this.isAtWorkplace = false;
		scene.tweens.add({
			targets: this,
			scaleX: this.baseScaleX * AProduct.WORKPLACE_SELECTION_SCALE,
			scaleY: this.baseScaleY * AProduct.WORKPLACE_SELECTION_SCALE,
			duration: 220,
			ease: "Cubic.Out",
			onComplete: () => {
				if (!this.active || !this.scene) {
					return;
				}
				this.isLaunching = false;
				this.isSelectingDip = true;
				levelScene.beginDipSelection(this);
				this.startSelectionTimeout(() => {
					this.cancelDipSelection();
				});
			}
		});
	}

	private startDeliverySelection() {

		const scene = this.getSafeScene();
		if (!scene) {
			return;
		}

		const levelScene = scene as Level;
		this.setPointerInteractionEnabled(false);
		this.isLaunching = true;
		this.isAtWorkplace = false;
		this.isReadyForDelivery = false;

		scene.tweens.add({
			targets: this,
			scaleX: this.baseScaleX * AProduct.WORKPLACE_SELECTION_SCALE,
			scaleY: this.baseScaleY * AProduct.WORKPLACE_SELECTION_SCALE,
			duration: 220,
			ease: "Cubic.Out",
			onComplete: () => {
				if (!this.active || !this.scene) {
					return;
				}
				this.isLaunching = false;
				this.isSelectingDelivery = true;
				levelScene.beginDeliverySelection(this);
				this.startSelectionTimeout(() => {
					this.cancelDeliverySelection();
				});
			}
		});
	}

	public canReceiveDirectDip() {

		return this.active
			&& this.isAtWorkplace
			&& !this.isReadyForDelivery
			&& !this.isLaunching
			&& !this.isSelectingDip
			&& !this.isSelectingDelivery;
	}

	public directApplyDip(dipType: "chocolate" | "candy") {

		if (!this.canReceiveDirectDip() || !this.currentWorkplaceId) {
			return;
		}

		const levelScene = this.scene as Level;
		this.setPointerInteractionEnabled(false);
		this.isAtWorkplace = false;
		this.isSelectingDip = true;
		levelScene.beginDipSelection(this);
		this.applyDip(dipType);
	}

	public applyDip(dipType: "chocolate" | "candy") {

		if (!this.isSelectingDip || !this.currentWorkplaceId || !this.active || !this.scene) {
			return;
		}

		const levelScene = this.scene as Level;
		const target = dipType === "chocolate" ? levelScene.chocolateDip : levelScene.candyDip;
		const appearance = dipType === "chocolate" ? this.ChocolateDip : this.CandyDip;

		this.isLaunching = true;
		this.isSelectingDip = false;
		this.clearSelectionTimeout();
		levelScene.clearDipSelection(this);
		this.playSwooshSound();
		this.scene.tweens.add({
			targets: this,
			x: target.x,
			y: target.y,
			duration: 320,
			ease: "Cubic.InOut",
			onComplete: () => {
				this.playDipSwapAnimation(appearance);
			}
		});
	}

	private playDipSwapAnimation(appearance: { key: string; frame?: string | number }) {

		const scene = this.getSafeScene();
		if (!scene) {
			return;
		}

		scene.tweens.add({
			targets: this,
			scaleX: 0,
			scaleY: 0,
			duration: AProduct.DIP_SCALE_DURATION,
			ease: "Cubic.In",
			onComplete: () => {
				if (!this.active || !this.scene) {
					return;
				}
				this.applyAppearance(appearance);
				ConfettiPrefab.launchSmallBurstAt(this.scene, this.x, this.y, this.depth + 1);
				this.scene.tweens.add({
					targets: this,
					scaleX: this.baseScaleX * 1.15,
					scaleY: this.baseScaleY * 1.15,
					duration: 180,
					ease: "Back.Out",
					onComplete: () => {
						if (!this.active || !this.scene) {
							return;
						}
						this.scene.tweens.add({
							targets: this,
							scaleX: this.baseScaleX,
							scaleY: this.baseScaleY,
							duration: 100,
							ease: "Sine.Out",
							onComplete: () => {
								this.returnToWorkplace();
							}
						});
					}
				});
			}
		});
	}

	private returnToWorkplace() {

		const scene = this.getSafeScene();
		if (!scene) {
			return;
		}

		this.setPointerInteractionEnabled(false);
		const levelScene = scene as Level;
		const workplace = this.currentWorkplaceId === "workplace1" ? levelScene.workplace1 : levelScene.workplace2;

		scene.tweens.add({
			targets: this,
			x: workplace.x,
			y: workplace.y,
			duration: 320,
			ease: "Cubic.InOut",
			onComplete: () => {
				if (!this.active || !this.scene) {
					return;
				}
				this.isLaunching = false;
				this.isAtWorkplace = true;
				this.isReadyForDelivery = true;
				this.setPointerInteractionEnabled(true);
				levelScene.launchTrayHintTrailFrom(this.x, this.y);
			}
		});
	}

	public deliverToClient(client: { x: number; y: number; matchesProduct(product: AProduct): boolean; canReceiveDelivery(): boolean; receiveProductDelivery(product: AProduct): boolean; consumeRequestAndExit(showYum?: boolean): void; }) {

		if (!this.isSelectingDelivery || !this.active || !this.scene) {
			return;
		}

		const levelScene = this.scene as Level;
		this.setPointerInteractionEnabled(false);
		const trayId = this.currentTrayId;
		this.clearSelectionTimeout();
		levelScene.clearDeliverySelection(this);
		levelScene.releaseWorkplace(this.currentWorkplaceId);
		if (trayId) {
			levelScene.releaseTraySlot(trayId, this);
		}
		this.currentWorkplaceId = undefined;
		this.currentTrayId = undefined;
		this.traySlotX = undefined;
		this.traySlotY = undefined;
		this.isSelectingDelivery = false;
		this.isLaunching = true;
		this.playSwooshSound();

		this.scene.tweens.add({
			targets: this,
			x: client.x,
			y: client.y,
			angle: this.baseAngle + AProduct.SPIN_ANGLE,
			duration: 360,
			ease: "Cubic.InOut",
			onComplete: () => {
				this.angle = this.baseAngle;

				if (!client.canReceiveDelivery()) {
					// Cliente ya no acepta (se fue / timeout): se pierde el producto.
					levelScene.playCanceledOrderSound();
					this.fallOffscreen();
					return;
				}

				if (client.matchesProduct(this)) {
					levelScene.showCoinsAt(client.x, getProductCoinReward(this.getProductSlotId()));
					const isOrderComplete = client.receiveProductDelivery(this);

					if (isOrderComplete) {
						client.consumeRequestAndExit(true);
					} else {
						this.scene.sound.play(`eating${Phaser.Math.Between(1, 3)}`);
					}

					this.destroy();
					return;
				}

				// Producto incorrecto: el cliente rechaza y se va.
				levelScene.showProductDiscardLossAt(client.x, client.y - 64);
				client.consumeRequestAndExit();

				this.fallOffscreen();
			}
		});
	}

	public cancelDeliverySelection() {

		if (!this.isSelectingDelivery) {
			return;
		}

		const levelScene = this.scene as Level;
		const hasTraySlot = this.currentTrayId && this.traySlotX !== undefined && this.traySlotY !== undefined;
		const workplace = this.currentWorkplaceId === "workplace1"
			? levelScene?.workplace1
			: this.currentWorkplaceId === "workplace2"
				? levelScene?.workplace2
				: undefined;
		const fallbackX = hasTraySlot ? this.traySlotX : workplace?.x ?? this.x;
		const fallbackY = hasTraySlot ? this.traySlotY : workplace?.y ?? this.y;

		this.setPointerInteractionEnabled(false);
		this.clearSelectionTimeout();
		levelScene?.clearDeliverySelection(this);
		this.isSelectingDelivery = false;
		this.isLaunching = true;

		this.scene.tweens.add({
			targets: this,
			x: fallbackX,
			y: fallbackY,
			scaleX: this.baseScaleX,
			scaleY: this.baseScaleY,
			duration: 220,
			ease: "Cubic.Out",
			onComplete: () => {
				this.isLaunching = false;
				this.isAtWorkplace = !this.currentTrayId;
				this.isReadyForDelivery = true;
				this.setPointerInteractionEnabled(true);
			}
		});
	}

	public placeInTray(trayId: "charola1" | "charola2", targetX: number, targetY: number) {

		if (!this.isSelectingDelivery) {
			return;
		}

		const levelScene = this.scene as Level;
		this.setPointerInteractionEnabled(false);
		this.clearSelectionTimeout();
		levelScene.clearDeliverySelection(this);
		levelScene.releaseWorkplace(this.currentWorkplaceId);
		this.currentWorkplaceId = undefined;
		this.isSelectingDelivery = false;
		this.isLaunching = true;
		this.currentTrayId = trayId;
		this.traySlotX = targetX;
		this.traySlotY = targetY;
		this.playSwooshSound();
		this.scene.tweens.killTweensOf(this);

		this.scene.tweens.add({
			targets: this,
			x: targetX,
			y: targetY,
			scaleX: this.baseScaleX,
			scaleY: this.baseScaleY,
			duration: 320,
			ease: "Cubic.InOut",
			onComplete: () => {
				this.resetScaleToBase();
				this.isLaunching = false;
				this.isAtWorkplace = false;
				this.isReadyForDelivery = true;
				levelScene.reserveTraySlot(trayId, this);
			}
		});
	}

	public snapToTraySlot(trayId: "charola1" | "charola2", x: number, y: number) {

		if (!this.active) {
			return;
		}

		this.currentTrayId = trayId;
		this.traySlotX = x;
		this.traySlotY = y;
		this.isAtWorkplace = false;
		this.setPosition(x, y);
		this.resetScaleToBase();
	}

	public cancelDipSelection() {

		if (!this.isSelectingDip || !this.currentWorkplaceId) {
			return;
		}

		const levelScene = this.scene as Level;
		const workplace = this.currentWorkplaceId === "workplace1" ? levelScene.workplace1 : levelScene.workplace2;

		this.setPointerInteractionEnabled(false);
		this.clearSelectionTimeout();
		levelScene.clearDipSelection(this);
		this.isSelectingDip = false;
		this.isLaunching = true;

		this.scene.tweens.add({
			targets: this,
			x: workplace.x,
			y: workplace.y,
			scaleX: this.baseScaleX,
			scaleY: this.baseScaleY,
			duration: 220,
			ease: "Cubic.Out",
			onComplete: () => {
				this.isLaunching = false;
				this.isAtWorkplace = true;
				this.isReadyForDelivery = false;
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

	private clearFryingState() {

		this.fryTimer?.remove(false);
		this.fryTimer = undefined;

		this.floatTween?.stop();
		this.floatTween = undefined;
	}

	private clearBurnState(keepTint = false) {

		this.burnTween?.stop();
		this.burnTween = undefined;
		this.burnProgress = 0;
		this.burnAlert?.stopPulse();
		this.burnAlert?.setVisible(false);
		this.burnAlert?.setAlpha(0);

		if (!keepTint) {
			this.clearTint();
		}
	}

	private queueWorkplaceTransferRetry() {

		if (!this.active || !this.isCooked || this.isBurned || this.isLaunching || this.currentWorkplaceId) {
			this.isWaitingForWorkplaceRetry = false;
			return;
		}

		this.clearWorkplaceTransferRetry();
		this.workplaceRetryTimer = this.scene.time.addEvent({
			delay: 150,
			loop: true,
			callback: () => {
				if (!this.active || !this.isCooked || this.isBurned || this.isLaunching || this.currentWorkplaceId) {
					this.clearWorkplaceTransferRetry();
					this.isWaitingForWorkplaceRetry = false;
					return;
				}

				this.pickUpFromFryer();
			}
		});
	}

	private clearWorkplaceTransferRetry() {

		this.workplaceRetryTimer?.remove(false);
		this.workplaceRetryTimer = undefined;
	}

	private startSelectionTimeout(onTimeout: () => void) {

		this.clearSelectionTimeout();
		this.selectionTimeout = this.scene.time.delayedCall(AProduct.SELECTION_TIMEOUT, () => {
			onTimeout();
		});
	}

	private clearSelectionTimeout() {

		this.selectionTimeout?.remove(false);
		this.selectionTimeout = undefined;
	}

	private playSwooshSound() {

		const swooshSoundKey = Phaser.Math.Between(0, 1) === 0 ? "swoosh" : "swoosh2";
		this.scene.sound.play(swooshSoundKey);
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

	private fallOffscreen() {

		const scene = this.getSafeScene();
		if (!scene) {
			return;
		}

		this.setPointerInteractionEnabled(false);
		this.isCooked = false;
		this.isBurned = false;
		this.isReadyForDelivery = false;
		this.isLaunching = true;

		scene.tweens.add({
			targets: this,
			y: scene.scale.height + this.height,
			angle: this.angle - AProduct.SPIN_ANGLE,
			alpha: 0.7,
			duration: 420,
			ease: "Cubic.In",
			onComplete: () => {
				if (this.active) {
					this.destroy();
				}
			}
		});
	}

	private applyAppearance(appearance: { key: string; frame?: string | number }) {

		if (appearance.frame !== undefined) {
			this.setTexture(appearance.key, appearance.frame);
			return;
		}

		this.setTexture(appearance.key);
	}

	private playSpawnTween() {

		const scene = this.getSafeScene();
		if (!scene) {
			return;
		}

		scene.tweens.add({
			targets: this,
			scaleX: this.baseScaleX * 1.08,
			scaleY: this.baseScaleY * 1.08,
			duration: 120,
			ease: "Back.Out",
			onComplete: () => {
				if (!this.active || !this.scene) {
					return;
				}
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

	private resetScaleToBase() {

		this.setScale(this.baseScaleX, this.baseScaleY);
	}

	private playPopTween(onComplete?: () => void) {

		const scene = this.getSafeScene();
		if (!scene) {
			return;
		}

		scene.tweens.killTweensOf(this);
		this.resetScaleToBase();

		scene.tweens.add({
			targets: this,
			scaleX: this.baseScaleX * 1.12,
			scaleY: this.baseScaleY * 1.12,
			duration: 90,
			yoyo: true,
			ease: "Quad.Out",
			onComplete: () => {
				onComplete?.();
			}
		});
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
