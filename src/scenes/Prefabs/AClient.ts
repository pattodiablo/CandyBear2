
// You can write more code here

/* START OF COMPILED CODE */

import SpineClient from "./SpineClient";
/* START-USER-IMPORTS */
import Phaser from "phaser";
import type AProduct from "./AProduct";
import type Level from "../Level";
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
	public ClientBack: {key:string,frame?:string|number} = {"key":"ClientBack"};

	/* START-USER-CODE */
	private readonly initialY: number;
	private questionFloatTween?: Phaser.Tweens.Tween;
	private questionRevealTimer?: Phaser.Time.TimerEvent;
	private requestWaitTimer?: Phaser.Time.TimerEvent;
	private requestUrgencyTimer?: Phaser.Time.TimerEvent;
	private requestExpiresAt = 0;
	private requestedProduct?: {key:string,frame?:string|number};

	private static readonly TARGET_Y = 370;
	private static readonly EXIT_Y = 470;
	private static readonly MOVE_SPEED = 120;
	private static readonly QUESTION_FLOAT_DISTANCE = 12;
	private static readonly QUESTION_EARLY_MAX = 900;
	private static readonly QUESTION_LATE_MAX = 2200;
	private static readonly REQUEST_WAIT_DURATION = 20000;
	private static readonly QUESTION_FLOAT_START_REMAINING = 5000;
	private static readonly URGENCY_UPDATE_INTERVAL = 100;
	private static readonly QUESTION_BASE_DURATION = 500;
	private static readonly QUESTION_MAX_SPEED_SCALE = 4;

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

		if (!this.canReceiveDelivery()) {
			return;
		}

			const levelScene = this.scene as Level;
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

		if (!this.active || this.requestedProduct) {
			return;
		}

		this.questionRevealTimer = undefined;
		this.applyClientAppearance({ key: "ClientBear" });
		this.requestedProduct = Math.random() < 0.5 ? this.Product1_Chocolate : this.Product1_Candy;
		this.applyProductSample(this.requestedProduct);
		this.productSample.setVisible(true);
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

		this.questionFloatTween?.stop();
		this.questionFloatTween = undefined;
		this.clientQuestion.y = -145;

		this.startRequestWaitTimer();
	}

	private startRequestWaitTimer() {

		this.stopRequestWaitTimer();
		this.requestExpiresAt = this.scene.time.now + AClient.REQUEST_WAIT_DURATION;
		this.requestUrgencyTimer = this.scene.time.addEvent({
			delay: AClient.URGENCY_UPDATE_INTERVAL,
			loop: true,
			callback: this.updateQuestionUrgency,
			callbackScope: this
		});
		this.requestWaitTimer = this.scene.time.delayedCall(AClient.REQUEST_WAIT_DURATION, () => {
			this.handleRequestTimeout();
		});
		this.updateQuestionUrgency();
	}

	private stopRequestWaitTimer() {

		this.requestWaitTimer?.remove(false);
		this.requestWaitTimer = undefined;
		this.requestUrgencyTimer?.remove(false);
		this.requestUrgencyTimer = undefined;
		this.requestExpiresAt = 0;
	}

	private updateQuestionUrgency() {

		if (!this.requestedProduct || this.requestExpiresAt <= 0) {
			return;
		}

		const remaining = Math.max(0, this.requestExpiresAt - this.scene.time.now);

		if (remaining > AClient.QUESTION_FLOAT_START_REMAINING) {
			return;
		}

		if (!this.questionFloatTween) {
			this.questionFloatTween = this.scene.tweens.add({
				targets: this.clientQuestion,
				y: this.clientQuestion.y - AClient.QUESTION_FLOAT_DISTANCE,
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

	private handleRequestTimeout() {

		if (!this.requestedProduct) {
			return;
		}

		const levelScene = this.scene as Level;
		levelScene.showSpentCoinsAt(this.x, this.y - 64);
		this.clearRequestState();
		this.consumeRequestAndExit();
	}

	public matchesProduct(product: AProduct) {

		if (!this.requestedProduct) {
			return false;
		}

		return product.matchesAppearance(this.requestedProduct);
	}

	public canReceiveDelivery() {

		return !!this.requestedProduct;
	}

	public consumeRequestAndExit(showYum = false) {

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
				if (showYum) {
					this.scene.sound.play(`eating${Phaser.Math.Between(1, 3)}`);
					levelScene.showYumAt(exitX);
				}
				levelScene.respawnClient(this);
			}
		});
	}

	private clearRequestState() {

		this.stopRequestWaitTimer();
		this.questionFloatTween?.stop();
		this.questionFloatTween = undefined;
		this.clientQuestion.setAlpha(0);
		this.clientQuestion.y = -145;
		this.clientQuestion.setScale(1);
		this.productSample.setVisible(false);
		this.requestedProduct = undefined;
	}

	private handleDestroyed() {

		this.questionRevealTimer?.remove(false);
		this.questionRevealTimer = undefined;
		this.stopRequestWaitTimer();
		this.questionFloatTween?.stop();
		this.questionFloatTween = undefined;
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
