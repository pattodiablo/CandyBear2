
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
import SmallHeartBurst from "./SmallHeartBurst";
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

		// order1
		const order1 = scene.add.image(-52, -237, "_MISSING");
		order1.visible = false;
		this.add(order1);

		// order2
		const order2 = scene.add.image(0, -237, "_MISSING");
		order2.visible = false;
		this.add(order2);

		// order_1
		const order_1 = scene.add.image(52, -237, "_MISSING");
		order_1.visible = false;
		this.add(order_1);

		this.clientQuestion = clientQuestion;
		this.productSample = productSample;
		this.clientBear = clientBear;
		this.order1 = order1;
		this.order2 = order2;
		this.order_1 = order_1;

		/* START-USER-CTR-CODE */
		this.clientBear = clientBear;
		this.orderIconSlots = [order1, order2, order_1];
		this.orderIconSlotSizes = this.orderIconSlots.map((slot) => ({
			width: slot.width > 0 ? slot.width : AClient.ORDER_ICON_FALLBACK_SIZE,
			height: slot.height > 0 ? slot.height : AClient.ORDER_ICON_FALLBACK_SIZE,
		}));
		this.initialY = this.y;
		this.clientQuestion.setAlpha(0);
		this.applyLevelAppearance();
		this.initializeInteraction();
		this.once(Phaser.GameObjects.Events.DESTROY, this.handleDestroyed, this);
		this.startEntrance();
		/* END-USER-CTR-CODE */
	}

	private clientQuestion: Phaser.GameObjects.Image;
	private productSample: Phaser.GameObjects.Image;
	private clientBear: SpineClient;
	private order1: Phaser.GameObjects.Image;
	private order2: Phaser.GameObjects.Image;
	private order_1: Phaser.GameObjects.Image;
	public Product1_Chocolate: {key:string,frame?:string|number} = {"key":"Product1Chocolate"};
	public Product1_Candy: {key:string,frame?:string|number} = {"key":"Product1Candy"};
	public ClientBack: {key:string,frame?:string|number} = {"key":"ClientBack"};

	/* START-USER-CODE */
	private readonly initialY: number;
	private questionFloatTween?: Phaser.Tweens.Tween;
	private questionRevealTimer?: Phaser.Time.TimerEvent;
	private requestWaitTimer?: Phaser.Time.TimerEvent;
	private requestUrgencyTimer?: Phaser.Time.TimerEvent;
	private requestExpiresAt = 0;
	private requestIssuedAt = 0;
	private initialOrderCount = 1;
	private pendingProducts: ClientRequestAppearance[] = [];
	private displayedProductIndex = 0;
	private productCarouselTimer?: Phaser.Time.TimerEvent;
	/** Pedidos fijos (p. ej. clientes de limpieza de bandeja al final del día). */
	private forcedOrders?: ClientRequestAppearance[];

	private static readonly TARGET_Y = 370;
	private static readonly EXIT_Y = 470;
	private static readonly MOVE_SPEED = 120;
	private static readonly QUESTION_FLOAT_DISTANCE = 12;
	private static readonly QUESTION_EARLY_MAX = 900;
	private static readonly QUESTION_LATE_MAX = 2200;

	static readonly COOKIE_WAIT_BONUS_MS = 6000;
	private static readonly PARTIAL_DELIVERY_HEART_Y_OFFSET = -48;
	/** Boost de like al servir muy rápido (multiplicador de la chance base del skin). */
	private static readonly QUICK_SERVICE_LIKE_BOOST = 1.35;
	/** Like casi seguro si el secreto era la galleta y se la dieron. */
	private static readonly COOKIE_SECRET_LIKE_CHANCE = 0.95;
	private static readonly QUICK_SERVICE_WINDOW_MS = 4000;
	private static readonly QUESTION_FLOAT_START_REMAINING = 5000;
	private static readonly URGENCY_UPDATE_INTERVAL = 100;
	private static readonly QUESTION_BASE_DURATION = 500;
	private static readonly QUESTION_BASE_Y = -145;
	private static readonly QUESTION_MAX_SPEED_SCALE = 4;
	private static readonly PRODUCT_DISPLAY_MS = 2000;
	private static readonly PRODUCT_SWAP_OUT_MS = 180;
	private static readonly PRODUCT_SWAP_IN_MS = 220;
	private static readonly ORDER_ICON_FALLBACK_SIZE = 36;
	private static readonly COOKIE_HINT_Y = -175;
	private static readonly COOKIE_HINT_SCALE = 1.15;
	private static readonly COOKIE_HINT_POP_MS = 220;
	private static readonly COOKIE_HINT_HOLD_MS = 750;
	private static readonly COOKIE_HINT_FADE_MS = 380;

	private readonly orderIconSlots: Phaser.GameObjects.Image[];
	private readonly orderIconSlotSizes: Array<{ width: number; height: number }>;
	private receivedCookieTreat = false;
	private cookieHintIcon?: Phaser.GameObjects.Image;

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

	private applyLevelAppearance() {
		const levelScene = this.scene as Level;

		if (typeof levelScene.getCurrentLevelNumber !== "function") {
			this.clientBear.applyAppearanceVariant(0);
			return;
		}

		this.clientBear.randomizeAppearanceForLevel(
			levelScene.getCurrentLevelNumber(),
			levelScene.getCurrentLevelDifficulty()
		);
	}

	private startEntrance() {

		this.applyClientAppearance({ key: "ClientBear" });

		const travelDuration = Math.max(0, ((AClient.TARGET_Y - this.y) / AClient.MOVE_SPEED) * 1000);
		this.scheduleQuestionReveal(travelDuration);
		this.maybeShowCookieLikeHint(travelDuration);

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

	/**
	 * Algunos ositos revelan por un momento el icono de galleta al caminar:
	 * pista de que el secreto para el like es darles una de la cookie jar.
	 */
	private maybeShowCookieLikeHint(travelDuration: number) {
		if (!this.clientBear.requiresCookieForLike()) {
			return;
		}

		this.clearCookieHint();

		const cookieHint = this.scene.add.image(0, AClient.COOKIE_HINT_Y, "cookie");
		cookieHint.setScale(0);
		cookieHint.setAlpha(0);
		this.add(cookieHint);
		this.cookieHintIcon = cookieHint;

		const revealDelay = Math.min(280, Math.max(80, travelDuration * 0.12));

		this.scene.time.delayedCall(revealDelay, () => {
			if (!this.active || !cookieHint.active) {
				return;
			}

			this.scene.tweens.add({
				targets: cookieHint,
				scaleX: AClient.COOKIE_HINT_SCALE,
				scaleY: AClient.COOKIE_HINT_SCALE,
				alpha: 1,
				duration: AClient.COOKIE_HINT_POP_MS,
				ease: "Back.Out",
				onComplete: () => {
					if (!cookieHint.active) {
						return;
					}

					this.scene.tweens.add({
						targets: cookieHint,
						y: AClient.COOKIE_HINT_Y - 18,
						scaleX: AClient.COOKIE_HINT_SCALE * 0.85,
						scaleY: AClient.COOKIE_HINT_SCALE * 0.85,
						alpha: 0,
						delay: AClient.COOKIE_HINT_HOLD_MS,
						duration: AClient.COOKIE_HINT_FADE_MS,
						ease: "Cubic.In",
						onComplete: () => {
							this.clearCookieHint();
						},
					});
				},
			});
		});
	}

	private clearCookieHint() {
		if (!this.cookieHintIcon) {
			return;
		}

		this.scene.tweens.killTweensOf(this.cookieHintIcon);

		if (this.cookieHintIcon.active) {
			this.cookieHintIcon.destroy();
		}

		this.cookieHintIcon = undefined;
	}

	/** Marca que este osito recibió galleta (wait bonus + secreto de like). */
	public receiveCookieTreat() {
		this.receivedCookieTreat = true;
	}

	public wantsCookieForLike() {
		return this.clientBear.requiresCookieForLike() && !this.receivedCookieTreat;
	}

	private scheduleQuestionReveal(travelDuration: number) {

		const revealOffset = Phaser.Math.Between(-AClient.QUESTION_EARLY_MAX, AClient.QUESTION_LATE_MAX);
		const revealDelay = Math.max(0, travelDuration + revealOffset);

		this.questionRevealTimer?.remove(false);
		this.questionRevealTimer = this.scene.time.delayedCall(revealDelay, () => {
			this.showClientQuestion();
		});
	}

	/** Asigna un pedido concreto antes de revelar la pregunta (limpieza de bandejas). */
	public assignForcedOrders(orders: ClientRequestAppearance[]) {
		if (orders.length === 0) {
			this.forcedOrders = undefined;
			return;
		}

		this.forcedOrders = orders.map((order) => ({ ...order }));
	}

	private showClientQuestion() {

		if (!this.active || this.hasActiveRequest()) {
			return;
		}

		this.questionRevealTimer = undefined;
		this.applyClientAppearance({ key: "ClientBear" });

		const levelScene = this.scene as Level;

		if (this.forcedOrders && this.forcedOrders.length > 0) {
			this.pendingProducts = this.forcedOrders.map((order) => ({ ...order }));
			this.initialOrderCount = this.pendingProducts.length;
			this.forcedOrders = undefined;
		} else {
			const orderCount = rollClientOrderCount(
				levelScene.getCurrentLevelNumber(),
				levelScene.getCurrentLevelDifficulty()
			);
			this.initialOrderCount = orderCount;
			this.pendingProducts = pickClientOrders(orderCount);
		}

		this.displayedProductIndex = 0;
		this.showDisplayedProduct(false);
		this.productSample.setVisible(true);
		this.syncOrderMiniIcons();
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
		this.syncOrderMiniIcons();
		this.startProductCarousel();
	}

	private stopProductCarousel() {

		this.productCarouselTimer?.remove(false);
		this.productCarouselTimer = undefined;
	}

	private startRequestWaitTimer() {

		this.stopRequestWaitTimer();
		const baseWaitMs = getClientRequestWaitDurationMs();
		const waitMs = Math.round(baseWaitMs * this.clientBear.getWaitMultiplier());
		this.requestExpiresAt = this.scene.time.now + waitMs;
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

		const isMultiProductOrder = this.pendingProducts.length > 1;

		this.pendingProducts.splice(matchedIndex, 1);

		if (matchedIndex < this.displayedProductIndex) {
			this.displayedProductIndex--;
		} else if (this.displayedProductIndex >= this.pendingProducts.length) {
			this.displayedProductIndex = 0;
		}

		if (this.hasActiveRequest()) {
			this.syncProductCarouselAfterFulfillment();

			if (isMultiProductOrder) {
				this.grantPartialDeliveryPatienceBonus();
			}
		}

		return !this.hasActiveRequest();
	}

	private grantPartialDeliveryPatienceBonus() {

		if (!this.extendRequestWaitTime(AClient.COOKIE_WAIT_BONUS_MS)) {
			return;
		}

		SmallHeartBurst.launchAt(
			this.scene,
			this.x,
			this.y + AClient.PARTIAL_DELIVERY_HEART_Y_OFFSET,
			this.depth + 2
		);
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

		const quickServiceWindowMs = AClient.QUICK_SERVICE_WINDOW_MS * this.initialOrderCount;

		return (this.scene.time.now - this.requestIssuedAt) <= quickServiceWindowMs;
	}

	/**
	 * Chance de like según el skin del osito.
	 * Algunos tienen el secreto de la galleta: sin cookie jar treat no dan like.
	 * Skins normales: más propensos los bajos; servicio rápido da un boost leve.
	 */
	private shouldGrantLike(wasQuickService: boolean) {
		if (this.clientBear.requiresCookieForLike()) {
			if (!this.receivedCookieTreat) {
				return false;
			}

			const cookieSecretChance = wasQuickService
				? 1
				: AClient.COOKIE_SECRET_LIKE_CHANCE;

			return Math.random() < cookieSecretChance;
		}

		let likeChance = this.clientBear.getLikeChance();

		if (wasQuickService) {
			likeChance = Math.min(1, likeChance * AClient.QUICK_SERVICE_LIKE_BOOST);
		}

		return Math.random() < likeChance;
	}

	public consumeRequestAndExit(showYum = false) {

		const wasQuickService = showYum && this.wasServedQuickly();
		const grantLike = showYum && this.shouldGrantLike(wasQuickService);

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

				if (grantLike) {
					const skinIndex = this.clientBear.getAppearanceVariantIndex();
					levelScene.showLikeHeartAt(exitX, () => {
						const yumPrefab = levelScene.showYumAt(exitX);
						levelScene.respawnClient(this, yumPrefab);
					}, skinIndex);
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
		this.hideOrderMiniIcons();
		this.scene.tweens.killTweensOf(this.productSample);
		this.resetQuestionUrgencyAnimation();
		this.clientQuestion.setAlpha(0);
		this.clientQuestion.setScale(1);
		this.productSample.setScale(1);
		this.productSample.setVisible(false);
		this.pendingProducts = [];
		this.displayedProductIndex = 0;
		this.requestIssuedAt = 0;
		this.initialOrderCount = 1;
	}

	private handleDestroyed() {

		this.questionRevealTimer?.remove(false);
		this.questionRevealTimer = undefined;
		this.stopRequestWaitTimer();
		this.stopProductCarousel();
		this.clearCookieHint();
		this.scene.tweens.killTweensOf(this.productSample);
		this.resetQuestionUrgencyAnimation();
	}

	private syncOrderMiniIcons() {

		this.hideOrderMiniIcons();

		if (this.pendingProducts.length < 2) {
			return;
		}

		const slotAssignments = this.pendingProducts.length === 2
			? [this.order1, this.order_1]
			: this.orderIconSlots;

		this.pendingProducts.forEach((appearance, index) => {
			const slot = slotAssignments[index];
			const slotSize = this.orderIconSlotSizes[this.orderIconSlots.indexOf(slot)];

			if (!slot || !slotSize) {
				return;
			}

			this.applyAppearanceToImage(slot, appearance, slotSize.width, slotSize.height);
			slot.setVisible(true);
		});
	}

	private hideOrderMiniIcons() {

		this.orderIconSlots.forEach((slot) => {
			slot.setVisible(false);
		});
	}

	private applyProductSample(appearance: ClientRequestAppearance) {

		this.applyAppearanceToImage(this.productSample, appearance);
	}

	private applyAppearanceToImage(
		image: Phaser.GameObjects.Image,
		appearance: ClientRequestAppearance,
		displayWidth?: number,
		displayHeight?: number,
	) {

		if (appearance.frame !== undefined) {
			image.setTexture(appearance.key, appearance.frame);
		} else {
			image.setTexture(appearance.key);
		}

		if (
			displayWidth !== undefined
			&& displayHeight !== undefined
			&& displayWidth > 0
			&& displayHeight > 0
		) {
			image.setDisplaySize(displayWidth, displayHeight);
		}
	}

	private applyClientAppearance(appearance: { key: string; frame?: string | number }) {
		void appearance;
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
