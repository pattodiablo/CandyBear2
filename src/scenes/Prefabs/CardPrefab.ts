
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
import { storeMomentCardAsBought } from "../momentProgress";
/* END-USER-IMPORTS */

export default class CardPrefab extends Phaser.GameObjects.Container {

	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? 0, y ?? -18);

		// Anverso
		const anverso = scene.add.container(0, -19);
		this.add(anverso);

		// anversoCard
		const anversoCard = scene.add.image(0, 37, "AnversoCard");
		anverso.add(anversoCard);

		// CoinCost
		const coinCost = scene.add.text(20, -4, "", {});
		coinCost.setOrigin(0.5, 0.5);
		coinCost.text = "0000";
		coinCost.setStyle({ "color": "#F8ECDA", "fontFamily": "Klop", "fontSize": "58px" });
		anverso.add(coinCost);

		// LikesCost
		const likesCost = scene.add.text(20, 79, "", {});
		likesCost.setOrigin(0.5, 0.5);
		likesCost.text = "0000";
		likesCost.setStyle({ "color": "#F8ECDA", "fontFamily": "Klop", "fontSize": "58px" });
		anverso.add(likesCost);

		// UpgradeDescription
		const upgradeDescription = scene.add.text(1, 340, "", {});
		upgradeDescription.setOrigin(0.5, 0.5);
		upgradeDescription.text = "Card upgrade description";
		upgradeDescription.setStyle({ "align": "center", "color": "#FF5F7E", "fixedWidth": 260, "fixedHeight": 200, "fontFamily": "Klop", "fontSize": "30px" });
		upgradeDescription.setWordWrapWidth(240);
		anverso.add(upgradeDescription);

		this.coinCost = coinCost;
		this.likesCost = likesCost;
		this.upgradeDescription = upgradeDescription;
		// awake handler
		this.scene.events.once("scene-awake", () => this.awake());

		/* START-USER-CTR-CODE */
		this.cardImage = anversoCard;
		/* END-USER-CTR-CODE */
	}

	private coinCost: Phaser.GameObjects.Text;
	private likesCost: Phaser.GameObjects.Text;
	private upgradeDescription: Phaser.GameObjects.Text;
	public Reverso: {key:string,frame?:string|number} = {"key":"reversoCard1"};
	public buyed: boolean = false;
	public cardNumber: number = 0;

	/* START-USER-CODE */
	/** Un poco más grande para legibilidad en mobile. */
	private static readonly CARD_SCALE = 0.74;
	private static readonly FLIP_HALF_DURATION = 160;
	private static readonly ANVERSO_TEXTURE_KEY = "AnversoCard";
	private static readonly UPGRADE_LOCKED_COLOR = "#FF5F7E";
	private static readonly UPGRADE_UNLOCKED_COLOR = "#72D7C7";
	private static readonly PREREQUISITE_LOCKED_ALPHA = 0.55;
	private static readonly PREREQUISITE_LOCKED_COST_COLOR = "#B8A99A";
	private static readonly DEFAULT_COST_COLOR = "#F8ECDA";
	private cardImage!: Phaser.GameObjects.Image;
	private isShowingAnverso = true;
	private isFlipping = false;
	private isInitialized = false;
	private isPrerequisiteLocked = false;
	private baseCardScaleX = 1;
	private floatBaseX = 0;
	private floatBaseY = 0;
	private floatBaseAngle = 0;
	private readonly floatTweens: Phaser.Tweens.Tween[] = [];

	private awake() {
		this.initializeCard();
	}

	public initializeCard() {
		if (this.isInitialized) {
			return;
		}

		this.isInitialized = true;
		this.setScale(CardPrefab.CARD_SCALE);
		this.baseCardScaleX = this.cardImage.scaleX;
		this.centerCardImageOrigin();
		this.applyBoughtState();
		this.applySideVisibility();
		this.setupInteractivity();
		this.startFloatAnimation();
	}

	public syncFloatBasePosition() {
		this.floatBaseX = this.x;
		this.floatBaseY = this.y;
		this.floatBaseAngle = this.angle;
	}

	public pauseFloatAnimation() {
		for (const floatTween of this.floatTweens) {
			floatTween.pause();
		}
	}

	public resumeFloatAnimation() {
		if (!this.isInitialized) {
			return;
		}

		this.startFloatAnimation();
	}

	private startFloatAnimation() {
		this.stopFloatAnimation();
		this.syncFloatBasePosition();

		const cardSeed = this.cardNumber > 0 ? this.cardNumber : 1;
		const verticalDuration = 2100 + ((cardSeed * 137) % 900);
		const horizontalDuration = 2800 + ((cardSeed * 89) % 1100);
		const rotationDuration = 3200 + ((cardSeed * 61) % 1200);
		const startDelay = (cardSeed * 53) % 700;
		const verticalOffset = 3 + (cardSeed % 4);
		const horizontalOffset = 1.2 + (cardSeed % 3) * 0.55;
		const rotationOffset = 0.45 + (cardSeed % 4) * 0.18;
		const horizontalDirection = cardSeed % 2 === 0 ? 1 : -1;

		this.floatTweens.push(
			this.scene.tweens.add({
				targets: this,
				y: this.floatBaseY - verticalOffset,
				duration: verticalDuration,
				ease: "Sine.InOut",
				yoyo: true,
				repeat: -1,
				delay: startDelay
			}),
			this.scene.tweens.add({
				targets: this,
				x: this.floatBaseX + (horizontalOffset * horizontalDirection),
				duration: horizontalDuration,
				ease: "Sine.InOut",
				yoyo: true,
				repeat: -1,
				delay: Math.floor(startDelay * 0.45)
			}),
			this.scene.tweens.add({
				targets: this,
				angle: this.floatBaseAngle + rotationOffset,
				duration: rotationDuration,
				ease: "Sine.InOut",
				yoyo: true,
				repeat: -1,
				delay: Math.floor(startDelay * 0.7)
			})
		);
	}

	private stopFloatAnimation() {
		for (const floatTween of this.floatTweens) {
			floatTween.stop();
		}

		this.floatTweens.length = 0;
	}

	private centerCardImageOrigin() {


		this.cardImage.setOrigin(0.5, 0.5);

	}

	private setupInteractivity() {
		this.cardImage.setInteractive({ useHandCursor: true });
		this.cardImage.removeAllListeners();

		if (this.buyed) {
			this.cardImage.on(Phaser.Input.Events.POINTER_DOWN, this.handleBoughtClick, this);
			return;
		}

		this.cardImage.on(Phaser.Input.Events.POINTER_DOWN, this.handleFlip, this);
	}

	private handleBoughtClick(pointer: Phaser.Input.Pointer) {
		pointer.event.stopPropagation();
		this.emit("preview-open");
	}

	private handleFlip() {
		if (this.isFlipping || this.buyed) {
			return;
		}

		if (this.isPrerequisiteLocked) {
			this.emit("purchase-blocked");
			return;
		}

		this.emit("purchase-request");
	}

	public setCosts(coinCost: number, likeCost: number) {
		this.coinCost.setText(String(coinCost));
		this.likesCost.setText(String(likeCost));
		this.applyCostPresentation();
	}

	public setUpgradeDescription(upgradeName: string, upgradeEffect = "") {
		if (!upgradeName) {
			this.upgradeDescription.setText("");
			this.applyUpgradeDescriptionPresentation();
			return;
		}

		this.upgradeDescription.setText(
			upgradeEffect ? `${upgradeName}\n${upgradeEffect}` : upgradeName
		);
		this.applyUpgradeDescriptionPresentation();
	}

	/**
	 * Bloquea la compra visualmente hasta que se compre el nivel previo de la línea.
	 */
	public setPrerequisiteLocked(locked: boolean) {
		this.isPrerequisiteLocked = locked && !this.buyed;
		this.setAlpha(this.isPrerequisiteLocked ? CardPrefab.PREREQUISITE_LOCKED_ALPHA : 1);
		this.applyCostPresentation();
		this.applyUpgradeDescriptionPresentation();
	}

	public isPurchaseBlockedByPrerequisite() {
		return this.isPrerequisiteLocked;
	}

	private applyCostPresentation() {
		const costColor = this.isPrerequisiteLocked
			? CardPrefab.PREREQUISITE_LOCKED_COST_COLOR
			: CardPrefab.DEFAULT_COST_COLOR;

		this.coinCost.setColor(costColor);
		this.likesCost.setColor(costColor);
	}

	private applyUpgradeDescriptionPresentation() {
		if (this.buyed) {
			this.upgradeDescription.setColor(CardPrefab.UPGRADE_UNLOCKED_COLOR);
		} else if (this.isPrerequisiteLocked) {
			this.upgradeDescription.setColor(CardPrefab.PREREQUISITE_LOCKED_COST_COLOR);
		} else {
			this.upgradeDescription.setColor(CardPrefab.UPGRADE_LOCKED_COLOR);
		}

		this.upgradeDescription.setVisible(this.buyed || this.isShowingAnverso);
	}

	public beginPurchaseFlip() {
		if (this.isFlipping || this.buyed || this.isPrerequisiteLocked) {
			return;
		}

		this.flipCard();
	}

	private flipCard() {
		this.isFlipping = true;
		this.pauseFloatAnimation();

		this.scene.tweens.add({
			targets: this.cardImage,
			scaleX: 0,
			duration: CardPrefab.FLIP_HALF_DURATION,
			ease: "Quad.In",
			onComplete: () => {
				this.swapTexture();
				this.applySideVisibility();

				this.scene.tweens.add({
					targets: this.cardImage,
					scaleX: this.baseCardScaleX,
					duration: CardPrefab.FLIP_HALF_DURATION,
					ease: "Quad.Out",
					onComplete: () => {
						this.isFlipping = false;
						this.syncFloatBasePosition();
						this.resumeFloatAnimation();

						if (!this.isShowingAnverso) {
							this.markAsBought();
						}
					}
				});
			}
		});
	}

	private swapTexture() {
		if (this.isShowingAnverso) {
			this.applyReversoTexture();
			return;
		}

		this.applyAnversoTexture();
	}

	private applyReversoTexture() {
		if (this.Reverso?.key) {
			if (this.Reverso.frame !== undefined) {
				this.cardImage.setTexture(this.Reverso.key, this.Reverso.frame);
			} else {
				this.cardImage.setTexture(this.Reverso.key);
			}
		}

		this.isShowingAnverso = false;
	}

	private applyAnversoTexture() {
		this.cardImage.setTexture(CardPrefab.ANVERSO_TEXTURE_KEY);
		this.isShowingAnverso = true;
	}

	private applyBoughtState() {
		if (!this.buyed) {
			return;
		}

		this.applyReversoTexture();
		this.cardImage.scaleX = this.baseCardScaleX;
		this.applyUpgradeDescriptionPresentation();
		this.setupInteractivity();
	}

	private markAsBought() {
		if (this.buyed) {
			return;
		}

		this.buyed = true;
		this.isPrerequisiteLocked = false;
		this.setAlpha(1);

		if (this.cardNumber > 0) {
			storeMomentCardAsBought(this.cardNumber);
		}

		this.applyCostPresentation();
		this.applyUpgradeDescriptionPresentation();
		this.setupInteractivity();
		this.emit("purchased", this.cardNumber);
	}

	private applySideVisibility() {
		const showCosts = this.isShowingAnverso && !this.buyed;

		this.coinCost.setVisible(showCosts);
		this.likesCost.setVisible(showCosts);
		this.applyUpgradeDescriptionPresentation();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
