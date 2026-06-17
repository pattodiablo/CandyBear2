
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
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
		const coinCost = scene.add.text(1, 0, "", {});
		coinCost.setOrigin(0.5, 0.5);
		coinCost.text = "0000";
		coinCost.setStyle({ "color": "#F8ECDA", "fontFamily": "Klop", "fontSize": "36px" });
		anverso.add(coinCost);

		// LikesCost
		const likesCost = scene.add.text(1, 86, "", {});
		likesCost.setOrigin(0.5, 0.5);
		likesCost.text = "0000";
		likesCost.setStyle({ "color": "#F8ECDA", "fontFamily": "Klop", "fontSize": "36px" });
		anverso.add(likesCost);

		this.coinCost = coinCost;
		this.likesCost = likesCost;
		// awake handler
		this.scene.events.once("scene-awake", () => this.awake());

		/* START-USER-CTR-CODE */
		this.cardImage = anversoCard;
		/* END-USER-CTR-CODE */
	}

	private coinCost: Phaser.GameObjects.Text;
	private likesCost: Phaser.GameObjects.Text;
	public Reverso!: {key:string,frame?:string|number};

	/* START-USER-CODE */
	private static readonly CARD_SCALE = 0.56;
	private static readonly FLIP_HALF_DURATION = 160;
	private static readonly ANVERSO_TEXTURE_KEY = "AnversoCard";
	private cardImage!: Phaser.GameObjects.Image;
	private isShowingAnverso = true;
	private isFlipping = false;
	private isInitialized = false;
	private baseCardScaleX = 1;

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
		this.applySideVisibility();
		this.setupInteractivity();
	}

	private centerCardImageOrigin() {


		this.cardImage.setOrigin(0.5, 0.5);

	}

	private setupInteractivity() {
		this.cardImage.setInteractive({ useHandCursor: true });
		this.cardImage.removeAllListeners();
		this.cardImage.on(Phaser.Input.Events.POINTER_DOWN, this.handleFlip, this);
	}

	private handleFlip() {
		if (this.isFlipping) {
			return;
		}

		this.flipCard();
	}

	private flipCard() {
		this.isFlipping = true;

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
					}
				});
			}
		});
	}

	private swapTexture() {
		if (this.isShowingAnverso) {
			if (this.Reverso?.key) {
				if (this.Reverso.frame !== undefined) {
					this.cardImage.setTexture(this.Reverso.key, this.Reverso.frame);
				} else {
					this.cardImage.setTexture(this.Reverso.key);
				}
			}

			this.isShowingAnverso = false;
			return;
		}

		this.cardImage.setTexture(CardPrefab.ANVERSO_TEXTURE_KEY);
		this.isShowingAnverso = true;
	}

	private applySideVisibility() {
		const showCosts = this.isShowingAnverso;

		this.coinCost.setVisible(showCosts);
		this.likesCost.setVisible(showCosts);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
