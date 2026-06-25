
// You can write more code here

/* START OF COMPILED CODE */

import SpineClient from "./SpineClient";
/* START-USER-IMPORTS */
import Phaser from "phaser";
import type AProduct from "./AProduct";
import type Level from "../Level";
import type milkglass from "./milkglass";
import type sandwichPrefab from "./sandwichPrefab";
import {
	pickClientOrders,
	rollClientOrderCount,
	type ClientRequestAppearance,
} from "../clientOrderPool";
import { getClientRequestWaitDurationMs } from "../momentUpgradeBonuses";
/* END-USER-IMPORTS */

export default class AClient extends Phaser.GameObjects.Container {

	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? 0, y ?? 0);

		// clientQuestion
		const clientQuestion = scene.add.image(-1, -145, "ClientQuestion");
		this.add(clientQuestion);

		// ProductSample
		const productSample = scene.add.image(0, -157, "Product1Cooked");
		productSample.visible = false;
		this.add(productSample);

		// clientBear
		const clientBear = new SpineClient(scene, scene.spine, 1, 9);
		this.add(clientBear);

		this.clientQuestion = clientQuestion;
		this.productSample = productSample;
		this.clientBear = clientBear;

		/* START-USER-CTR-CODE */
		this.clientBear = clientBear;
		this.initialY = this.y;
		this.clientQuestion.setAlpha(0);
		this.initializeInteraction();
		this.once(Phaser.GameObjects.Events.DESTROY, this.handleDestroyed, this);
		this.startEntrance();
		/* END-USER-CTR-CODE */
	}

	private clientQuestion: Phaser.GameObjects.Image;
	private productSample: Phaser.GameObjects.Image;
	private clientBear: SpineClient;
	public Product1_Chocolate: {key:string,frame?:string|number} = {"key":"Product1Chocolate"};
	public Product1_Candy: {key:string,frame?:string|number} = {"key":"Product1Candy"};
	public Product2_Chocolate: {key:string,frame?:string|number} = {"key":"Product2Chocolate"};
	public Product2_Candy: {key:string,frame?:string|number} = {"key":"Product2Candy"};
	public MilkGlass_Filled: {key:string,frame?:string|number} = {"key":"GlassAnim","frame":"Vaso0089.png"};
	public MilkGlass_Green: {key:string,frame?:string|number} = {"key":"GreenGlass"};
	public MilkGlass_Red: {key:string,frame?:string|number} = {"key":"RedGlass"};
	public Sandwich_Filled: {key:string,frame?:string|number} = {"key":"sandWichAnim","frame":"sandwich0005.png"};
	public ClientBack: {key:string,frame?:string|number} = {"key":"ClientBack"};

	/* START-USER-CODE */
	private readonly initialY: number;
	private questionFloatTween?: Phaser.Tweens.Tween;
	private questionRevealTimer?: Phaser.Time.TimerEvent;
	private requestWaitTimer?: Phaser.Time.TimerEvent;
	private requestUrgencyTimer?: Phaser.Time.TimerEvent;
	private requestExpiresAt = 0;
	private requestIssuedAt = 0;
	private pendingProducts: ClientRequestAppearance[] = [];
	private displayedProductIndex = 0;
	private productCarouselTimer?: Phaser.Time.TimerEvent;

	private static readonly TARGET_Y = 370;
	private static readonly EXIT_Y = 470;
	private static readonly MOVE_SPEED = 120;
	private static readonly QUESTION_FLOAT_DISTANCE = 12;
	private static readonly QUESTION_EARLY_MAX = 900;
	private static readonly QUESTION_LATE_MAX = 2200;

	static readonly COOKIE_WAIT_BONUS_MS = 6000;
	private static readonly QUICK_SERVICE_WINDOW_MS = 4000;
	private static readonly QUESTION_FLOAT_START_REMAINING = 5000;
	private static readonly URGENCY_UPDATE_INTERVAL = 100;
	private static readonly QUESTION_BASE_DURATION = 500;
	private static readonly QUESTION_BASE_Y = -145;
	private static readonly QUESTION_MAX_SPEED_SCALE = 4;
	private static readonly PRODUCT_DISPLAY_MS = 2000;
	private static readonly PRODUCT_SWAP_OUT_MS = 180;
	private static readonly PRODUCT_SWAP_IN_MS = 220;

	private hasActiveRequest() {
		return this.pendingProducts.length > 0;
	}

	private initializeInteraction() {

		this.setSize(180, 220);
		this.setInteractive(new Phaser.Geom.Rectangle(-90, -160, 180, 220), Phaser.Geom.Rectangle.Contains);
		this.on(Phaser.Input.Events.POINTER_DOWN, this.handleDeliveryTargetClick, this);

		this.clientBear.setInteractive({ useHandCursor: true });
		this.clientBear.on(Phaser.Input.Events.POINTER_DOWN, this.handleDeliveryTargetClick, this);

		this.clientQuestion.setInteractive({ useHandCursor: true });
		this.clientQuestion.on(Phaser.Input.Events.POINTER_DOWN, this.handleDeliveryTargetClick, this);

		this.productSample.setInteractive({ useHandCursor: true });
		this.productSample.on(Phaser.Input.Events.POINTER_DOWN, this.handleDeliveryTargetClick, this);
	}

	private handleDeliveryTargetClick() {
		const levelScene = this.scene as Level;

		if (levelScene.hasSelectedDelivery()) {
			levelScene.resolveDeliverySelection(this);
			return;
		}

		if (!this.canReceiveDelivery()) {
			return;
		}

		levelScene.resolveDeliverySelection(this);
	}

	private startEntrance() {

		this.applyClientAppearance({ key: "ClientBear" });

		const travelDuration = Math.max(0, ((AClient.TARGET_Y - this.y) / AClient.MOVE_SPEED) * 1000);
		this.scheduleQuestionReveal(travelDuration);

		if (this.y >= AClient.TARGET_Y) {
			this.y = AClient.TARGET_Y;
			this.clientBear.playAnimation("idle");
			return;
		}

		this.clientBear.playAnimation("walk");

		this.scene.tweens.add({
			targets: this,
			y: AClient.TARGET_Y,
			duration: travelDuration,
			ease: "Linear",
			onComplete: () => {
				this.clientBear.playAnimation("idle");
			}
		});
	}

	private scheduleQuestionReveal(travelDuration: number) {

		const revealOffset = Phaser.Math.Between(-AClient.QUESTION_EARLY_MAX, AClient.QUESTION_LATE_MAX);
		const revealDelay = Math.max(0, travelDuration + revealOffset);

		this.questionRevealTimer?.remove(false);
		this.questionRevealTimer = this.scene.time.delayedCall(revealDelay, () => {
			this.showClientQuestion();
		});
	}

	private showClientQuestion() {

		if (!this.active || this.hasActiveRequest()) {
			return;
		}

		this.questionRevealTimer = undefined;
		this.applyClientAppearance({ key: "ClientBear" });

		const levelScene = this.scene as Level;
		const orderCount = rollClientOrderCount(
			levelScene.getCurrentLevelNumber(),
			levelScene.getCurrentLevelDifficulty()
		);
		this.pendingProducts = pickClientOrders(orderCount);
		this.displayedProductIndex = 0;
		this.showDisplayedProduct(false);
		this.productSample.setVisible(true);
		this.startProductCarousel();
		this.clientQuestion.setAlpha(0);
		this.clientQuestion.setScale(0.4);
		this.scene.tweens.add({
			targets: this.clientQuestion,
			alpha: 1,
			scaleX: 1,
			scaleY: 1,
			duration: 220,
			ease: "Back.Out"
		});

		this.resetQuestionUrgencyAnimation();

		this.requestIssuedAt = this.scene.time.now;
		this.startRequestWaitTimer();
	}

	private startProductCarousel() {

		this.stopProductCarousel();

		if (this.pendingProducts.length <= 1) {
			return;
		}

		this.productCarouselTimer = this.scene.time.addEvent({
			delay: AClient.PRODUCT_DISPLAY_MS,
			loop: true,
			callback: this.advanceProductCarousel,
			callbackScope: this,
		});
	}

	private advanceProductCarousel() {

		if (this.pendingProducts.length <= 1) {
			return;
		}

		this.displayedProductIndex = (this.displayedProductIndex + 1) % this.pendingProducts.length;
		this.showDisplayedProduct(true);
	}

	private showDisplayedProduct(animateSwap: boolean) {

		const product = this.pendingProducts[this.displayedProductIndex];

		if (!product) {
			return;
		}

		if (!animateSwap) {
			this.scene.tweens.killTweensOf(this.productSample);
			this.applyProductSample(product);
			this.productSample.setScale(1);
			return;
		}

		this.scene.tweens.killTweensOf(this.productSample);
		this.scene.tweens.add({
			targets: this.productSample,
			scaleX: 0,
			scaleY: 0,
			duration: AClient.PRODUCT_SWAP_OUT_MS,
			ease: "Cubic.In",
			onComplete: () => {
				if (!this.active || !this.hasActiveRequest()) {
					return;
				}

				this.applyProductSample(this.pendingProducts[this.displayedProductIndex] ?? product);
				this.scene.tweens.add({
					targets: this.productSample,
					scaleX: 1,
					scaleY: 1,
					duration: AClient.PRODUCT_SWAP_IN_MS,
					ease: "Back.Out",
				});
			},
		});
	}

	private syncProductCarouselAfterFulfillment() {

		if (!this.hasActiveRequest()) {
			return;
		}

		if (this.displayedProductIndex >= this.pendingProducts.length) {
			this.displayedProductIndex = 0;
		}

		this.stopProductCarousel();
		this.showDisplayedProduct(this.pendingProducts.length > 1);
		this.startProductCarousel();
	}

	private stopProductCarousel() {

		this.productCarouselTimer?.remove(false);
		this.productCarouselTimer = undefined;
	}

	private startRequestWaitTimer() {

		this.stopRequestWaitTimer();
		this.requestExpiresAt = this.scene.time.now + getClientRequestWaitDurationMs();
		this.scheduleRequestWaitTimers();
	}

	private scheduleRequestWaitTimers() {
		const remaining = Math.max(0, this.requestExpiresAt - this.scene.time.now);

		this.stopRequestWaitTimersOnly();

		if (remaining <= 0) {
			this.handleRequestTimeout();
			return;
		}

		this.requestUrgencyTimer = this.scene.time.addEvent({
			delay: AClient.URGENCY_UPDATE_INTERVAL,
			loop: true,
			callback: this.updateQuestionUrgency,
			callbackScope: this
		});
		this.requestWaitTimer = this.scene.time.delayedCall(remaining, () => {
			this.handleRequestTimeout();
		});
		this.updateQuestionUrgency();
	}

	private stopRequestWaitTimersOnly() {

		this.requestWaitTimer?.remove(false);
		this.requestWaitTimer = undefined;
		this.requestUrgencyTimer?.remove(false);
		this.requestUrgencyTimer = undefined;
	}

	private stopRequestWaitTimer() {

		this.stopRequestWaitTimersOnly();
		this.requestExpiresAt = 0;
	}

	public extendRequestWaitTime(extraMs: number) {

		if (!this.hasActiveRequest() || this.requestExpiresAt <= 0) {
			return false;
		}

		this.requestExpiresAt += extraMs;
		this.scheduleRequestWaitTimers();
		return true;
	}

	private updateQuestionUrgency() {

		if (!this.hasActiveRequest() || this.requestExpiresAt <= 0) {
			return;
		}

		const remaining = Math.max(0, this.requestExpiresAt - this.scene.time.now);

		if (remaining > AClient.QUESTION_FLOAT_START_REMAINING) {
			this.resetQuestionUrgencyAnimation();
			return;
		}

		if (!this.questionFloatTween) {
			this.clientQuestion.y = AClient.QUESTION_BASE_Y;
			this.questionFloatTween = this.scene.tweens.add({
				targets: this.clientQuestion,
				y: AClient.QUESTION_BASE_Y - AClient.QUESTION_FLOAT_DISTANCE,
				duration: AClient.QUESTION_BASE_DURATION,
				yoyo: true,
				repeat: -1,
				ease: "Sine.InOut"
			});
		}

		const progress = 1 - remaining / AClient.QUESTION_FLOAT_START_REMAINING;
		const speedScale = Phaser.Math.Linear(1, AClient.QUESTION_MAX_SPEED_SCALE, progress);
		this.questionFloatTween.setTimeScale(speedScale);
	}

	private resetQuestionUrgencyAnimation() {

		this.questionFloatTween?.stop();
		this.questionFloatTween = undefined;
		this.clientQuestion.y = AClient.QUESTION_BASE_Y;
	}

	private handleRequestTimeout() {

		if (!this.hasActiveRequest()) {
			return;
		}

		const levelScene = this.scene as Level;
		levelScene.showSpentCoinsAt(this.x, this.y - 64);
		this.clearRequestState();
		this.consumeRequestAndExit();
	}

	public matchesProduct(product: AProduct | milkglass | sandwichPrefab) {

		if (!this.hasActiveRequest()) {
			return false;
		}

		return this.pendingProducts.some((appearance) => product.matchesAppearance(appearance));
	}

	public receiveProductDelivery(product: AProduct | milkglass | sandwichPrefab) {

		const matchedIndex = this.pendingProducts.findIndex((appearance) => (
			product.matchesAppearance(appearance)
		));

		if (matchedIndex < 0) {
			return false;
		}

		this.pendingProducts.splice(matchedIndex, 1);

		if (matchedIndex < this.displayedProductIndex) {
			this.displayedProductIndex--;
		} else if (this.displayedProductIndex >= this.pendingProducts.length) {
			this.displayedProductIndex = 0;
		}

		if (this.hasActiveRequest()) {
			this.syncProductCarouselAfterFulfillment();
		}

		return !this.hasActiveRequest();
	}

	public canReceiveDelivery() {

		return this.hasActiveRequest();
	}

	public getPendingRequestAppearances() {

		return [...this.pendingProducts];
	}

	public getDisplayedRequestAppearance() {

		return this.pendingProducts[this.displayedProductIndex];
	}

	public getRemainingRequestTime() {

		if (!this.hasActiveRequest() || this.requestExpiresAt <= 0) {
			return Number.POSITIVE_INFINITY;
		}

		return Math.max(0, this.requestExpiresAt - this.scene.time.now);
	}

	public isImpatient() {

		if (!this.hasActiveRequest() || this.requestExpiresAt <= 0) {
			return false;
		}

		return this.getRemainingRequestTime() <= AClient.QUESTION_FLOAT_START_REMAINING;
	}

	private wasServedQuickly() {

		if (this.requestIssuedAt <= 0) {
			return false;
		}

		return (this.scene.time.now - this.requestIssuedAt) <= AClient.QUICK_SERVICE_WINDOW_MS;
	}

	public consumeRequestAndExit(showYum = false) {

		const wasQuickService = showYum && this.wasServedQuickly();

		this.questionRevealTimer?.remove(false);
		this.questionRevealTimer = undefined;
		this.clearRequestState();
		this.applyClientAppearance(this.ClientBack);
		this.clientBear.playAnimation("walk");
		const exitX = this.x;

		const exitDuration = Math.max(0, ((AClient.EXIT_Y - this.y) / AClient.MOVE_SPEED) * 1000);

		this.scene.tweens.add({
			targets: this,
			y: AClient.EXIT_Y,
			duration: exitDuration,
			ease: "Sine.In",
			onComplete: () => {
				const levelScene = this.scene as Level;

				if (!showYum) {
					levelScene.respawnClient(this);
					return;
				}

				levelScene.recordSuccessfulDelivery();
				this.scene.sound.play(`eating${Phaser.Math.Between(1, 3)}`);

				if (wasQuickService) {
					levelScene.showLikeHeartAt(exitX, () => {
						const yumPrefab = levelScene.showYumAt(exitX);
						levelScene.respawnClient(this, yumPrefab);
					});
					return;
				}

				const yumPrefab = levelScene.showYumAt(exitX);
				levelScene.respawnClient(this, yumPrefab);
			}
		});
	}

	private clearRequestState() {

		this.stopRequestWaitTimer();
		this.stopProductCarousel();
		this.scene.tweens.killTweensOf(this.productSample);
		this.resetQuestionUrgencyAnimation();
		this.clientQuestion.setAlpha(0);
		this.clientQuestion.setScale(1);
		this.productSample.setScale(1);
		this.productSample.setVisible(false);
		this.pendingProducts = [];
		this.displayedProductIndex = 0;
		this.requestIssuedAt = 0;
	}

	private handleDestroyed() {

		this.questionRevealTimer?.remove(false);
		this.questionRevealTimer = undefined;
		this.stopRequestWaitTimer();
		this.stopProductCarousel();
		this.scene.tweens.killTweensOf(this.productSample);
		this.resetQuestionUrgencyAnimation();
	}

	private applyProductSample(appearance: { key: string; frame?: string | number }) {

		if (appearance.frame !== undefined) {
			this.productSample.setTexture(appearance.key, appearance.frame);
			return;
		}

		this.productSample.setTexture(appearance.key);
	}

	private applyClientAppearance(appearance: { key: string; frame?: string | number }) {
		void appearance;
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
