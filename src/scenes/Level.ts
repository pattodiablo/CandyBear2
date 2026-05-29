
// You can write more code here

/* START OF COMPILED CODE */

import AProduct from "./Prefabs/AProduct";
import PanelPrefab from "./Prefabs/PanelPrefab";
/* START-USER-IMPORTS */
import Phaser from "phaser";
import AClient from "./Prefabs/AClient";	
import YumPrefab from "./Prefabs/YumPrefab";
import Coin from "./Prefabs/Coin";
import { SkinsAndAnimationBoundsProvider } from "@esotericsoftware/spine-phaser-v4";
/* END-USER-IMPORTS */

export default class Level extends Phaser.Scene {

	constructor() {
		super("Level");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// workstation
		const workstation = this.add.image(654, 563, "Workstation");

		// fryer1
		const fryer1 = this.add.image(640, 522, "Fryer");

		// fryer2
		const fryer2 = this.add.image(640, 654, "Fryer");

		// holder
		this.add.image(79, 544, "Holder");

		// holder_1
		this.add.image(211, 544, "Holder");

		// holder_2
		this.add.image(339, 544, "Holder");

		// holder_3
		this.add.image(465, 544, "Holder");

		// workplace1
		const workplace1 = this.add.image(817, 543, "workplace");

		// workplace2
		const workplace2 = this.add.image(947, 543, "workplace");

		// chocolateDip
		const chocolateDip = this.add.image(1078, 543, "ChocolateDip");

		// candyDip
		const candyDip = this.add.image(1213, 543, "CandyDip");

		// chocolateIcon
		this.add.image(1077, 539, "chocolateIcon");

		// candyicon
		this.add.image(1212, 539, "candyicon");

		// lamp
		this.add.image(193, 57, "lamp");

		// lamp_1
		this.add.image(1035, 57, "lamp");

		// rawProduct1
		const rawProduct1 = new AProduct(this, 78, 547);
		this.add.existing(rawProduct1);

		// rawProduct
		const rawProduct = new AProduct(this, 207, 547);
		this.add.existing(rawProduct);

		// rawProduct_1
		const rawProduct_1 = new AProduct(this, 338, 547);
		this.add.existing(rawProduct_1);

		// rawProduct_2
		const rawProduct_2 = new AProduct(this, 469, 547);
		this.add.existing(rawProduct_2);

		// blurOverlay
		const blurOverlay = this.add.image(0, 0, "blurOverlay");
		blurOverlay.scaleX = 7;
		blurOverlay.scaleY = 4;
		blurOverlay.setOrigin(0, 0);

		// panel
		const panel = new PanelPrefab(this, 595, 360);
		this.add.existing(panel);

		// bigCoin
		this.add.image(52, 58, "bigCoin");

		this.workstation = workstation;
		this.fryer1 = fryer1;
		this.fryer2 = fryer2;
		this.workplace1 = workplace1;
		this.workplace2 = workplace2;
		this.chocolateDip = chocolateDip;
		this.candyDip = candyDip;
		this.blurOverlay = blurOverlay;
		this.panel = panel;

		this.events.emit("scene-awake");
	}

	private workstation!: Phaser.GameObjects.Image;
	public fryer1!: Phaser.GameObjects.Image;
	public fryer2!: Phaser.GameObjects.Image;
	public workplace1!: Phaser.GameObjects.Image;
	public workplace2!: Phaser.GameObjects.Image;
	public chocolateDip!: Phaser.GameObjects.Image;
	public candyDip!: Phaser.GameObjects.Image;
	private blurOverlay!: Phaser.GameObjects.Image;
	private panel!: PanelPrefab;

	/* START-USER-CODE */
	private static readonly INITIAL_CLIENT_COUNT = 1;
	private static readonly TRIPLE_CLIENT_CHANCE = 0.2;
	private static readonly DOUBLE_CLIENT_CHANCE = 0.45;
	private static readonly INTRO_OVERLAY_FADE_IN_DURATION = 220;
	private static readonly INTRO_OVERLAY_FADE_OUT_DURATION = 380;
	private static readonly INTRO_PANEL_DROP_DURATION = 620;
	private static readonly INTRO_PANEL_EXIT_DURATION = 300;
	private static readonly INTRO_PANEL_START_OFFSET = 220;
	private static readonly CLIENT_SIDE_PADDING = 100;
	private static readonly CLIENT_MIN_SPACING = 180;
	private static readonly REWARD_COIN_Y = 307;
	private static readonly REWARD_COIN_LAND_Y = 422;
	private static readonly REWARD_COIN_RISE = 18;
	private static readonly COIN_OFFSETS = [-26, 0, 26];
	private static readonly REWARD_COIN_STAGGER = 70;
	private static readonly REWARD_COIN_FALL_DURATION_MIN = 240;
	private static readonly REWARD_COIN_FALL_DURATION_MAX = 360;
	private static readonly REWARD_COIN_COLLECT_DELAY = 1600;
	private static readonly SPENT_COIN_START_OFFSET = 48;
	private static readonly SPENT_COIN_RISE = 100;
	private static readonly SPENT_COIN_RISE_DURATION = 220;
	private static readonly SPENT_COIN_FALL_DURATION_MIN = 280;
	private static readonly SPENT_COIN_FALL_DURATION_MAX = 420;
	public fryer2Enabled = true;
	public workplace2Enabled = true;

	private clientSpawnY = -103;
	private activeClients: AClient[] = [];
	private hasCompletedFirstClientRound = false;
	private fryer1Occupied = false;
	private fryer2Occupied = false;
	private workplace1Occupied = false;
	private workplace2Occupied = false;
	private selectedDipProduct?: AProduct;
	private selectedDeliveryProduct?: AProduct;
	private coinCount = 0;
	private coinCounterText?: Phaser.GameObjects.Text;
	private backgroundMusic?: Phaser.Sound.BaseSound;
	// Write your code here

	private initializeCoinCounter() {

		this.coinCounterText = this.add.text(90, 40, "0", {
			color: "#5c2c16",
			fontFamily: "Arial",
			fontSize: "28px",
			fontStyle: "bold",
			stroke: "#fff4d6",
			strokeThickness: 6,
		});
		this.coinCounterText.setScrollFactor(0);
		this.coinCounterText.setDepth(this.workstation.depth + 10);
		this.updateCoinCounter();
	}

	private setupIntroOverlay() {

		this.blurOverlay.setScrollFactor(0);
		this.blurOverlay.setDepth(1000);
		this.blurOverlay.setAlpha(0);
		this.blurOverlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.scale.width, this.scale.height), Phaser.Geom.Rectangle.Contains);

		this.panel.setScrollFactor(0);
		this.panel.setDepth(1001);
		this.panel.disableReadyButton();
	}

	private startBackgroundMusic() {

		if (this.backgroundMusic?.isPlaying) {
			return;
		}

		this.backgroundMusic = this.sound.add("backgroundMusic", { loop: true, volume: 0.5 });
		this.backgroundMusic.play();
	}

	private dismissSceneIntro(panelStartY: number) {

		this.panel.disableReadyButton();
		this.tweens.add({
			targets: this.panel,
			y: panelStartY,
			alpha: 0,
			duration: Level.INTRO_PANEL_EXIT_DURATION,
			ease: "Back.In"
		});

		this.tweens.add({
			targets: this.blurOverlay,
			alpha: 0,
			duration: Level.INTRO_OVERLAY_FADE_OUT_DURATION,
			ease: "Quad.InOut",
			onComplete: () => {
				this.blurOverlay.disableInteractive();
				this.blurOverlay.setVisible(false);
				this.panel.setVisible(false);
				this.spawnInitialClients();
			}
		});
	}

	private playSceneIntro() {

		const panelFinalY = this.panel.y;
		const panelStartY = -this.panel.displayHeight - Level.INTRO_PANEL_START_OFFSET;

		this.panel.y = panelStartY;
		this.panel.setAlpha(1);
		this.blurOverlay.setVisible(true);
		this.panel.setVisible(true);

		this.tweens.add({
			targets: this.blurOverlay,
			alpha: 1,
			duration: Level.INTRO_OVERLAY_FADE_IN_DURATION,
			ease: "Quad.Out"
		});

		this.tweens.add({
			targets: this.panel,
			y: panelFinalY,
			duration: Level.INTRO_PANEL_DROP_DURATION,
			ease: "Bounce.Out",
			onComplete: () => {
				this.panel.enableReadyButton(() => {
					this.startBackgroundMusic();
					this.dismissSceneIntro(panelStartY);
				});
			}
		});
	}

	private updateCoinCounter() {

		this.coinCounterText?.setText(`${this.coinCount}`);
	}

	private addCoins(amount: number) {

		this.coinCount = Math.max(0, this.coinCount + amount);
		this.updateCoinCounter();
	}

	private getCoinOffsets(count: number) {

		if (count <= 1) {
			return [0];
		}

		if (count === 2) {
			return [-13, 13];
		}

		return Level.COIN_OFFSETS;
	}

	public claimAvailableFryer() {

		if (!this.fryer1Occupied) {
			this.fryer1Occupied = true;
			return { id: "fryer1" as const, target: this.fryer1 };
		}

		if (this.fryer2Enabled && !this.fryer2Occupied) {
			this.fryer2Occupied = true;
			return { id: "fryer2" as const, target: this.fryer2 };
		}

		return null;
	}

	public releaseFryer(fryerId?: "fryer1" | "fryer2") {

		if (fryerId === "fryer1") {
			this.fryer1Occupied = false;
			return;
		}

		if (fryerId === "fryer2") {
			this.fryer2Occupied = false;
		}
	}

	public claimAvailableWorkplace() {

		if (!this.workplace1Occupied) {
			this.workplace1Occupied = true;
			return { id: "workplace1" as const, target: this.workplace1 };
		}

		if (this.workplace2Enabled && !this.workplace2Occupied) {
			this.workplace2Occupied = true;
			return { id: "workplace2" as const, target: this.workplace2 };
		}

		return null;
	}

	public releaseWorkplace(workplaceId?: "workplace1" | "workplace2") {

		if (workplaceId === "workplace1") {
			this.workplace1Occupied = false;
			return;
		}

		if (workplaceId === "workplace2") {
			this.workplace2Occupied = false;
		}
	}

	public beginDipSelection(product: AProduct) {

		if (this.selectedDipProduct && this.selectedDipProduct !== product) {
			this.selectedDipProduct.cancelDipSelection();
		}

		this.selectedDipProduct = product;
	}

	public clearDipSelection(product?: AProduct) {

		if (!product || this.selectedDipProduct === product) {
			this.selectedDipProduct = undefined;
		}
	}

	public resolveDipSelection(dipType: "chocolate" | "candy") {

		if (!this.selectedDipProduct) {
			const directDipProduct = this.getDirectDipProduct(dipType);
			directDipProduct?.directApplyDip(dipType);
			return;
		}

		this.selectedDipProduct?.applyDip(dipType);
	}

	private getDirectDipProduct(dipType: "chocolate" | "candy") {

		const targetX = dipType === "chocolate" ? this.chocolateDip.x : this.candyDip.x;
		const dipCandidates = this.children.list
			.filter((child): child is AProduct => child instanceof AProduct)
			.filter((product) => product.canReceiveDirectDip());

		if (dipCandidates.length === 0) {
			return undefined;
		}

		dipCandidates.sort((left, right) => Math.abs(left.x - targetX) - Math.abs(right.x - targetX));
		return dipCandidates[0];
	}

	public beginDeliverySelection(product: AProduct) {

		if (this.selectedDeliveryProduct && this.selectedDeliveryProduct !== product) {
			this.selectedDeliveryProduct.cancelDeliverySelection();
		}

		this.selectedDeliveryProduct = product;
	}

	public clearDeliverySelection(product?: AProduct) {

		if (!product || this.selectedDeliveryProduct === product) {
			this.selectedDeliveryProduct = undefined;
		}
	}

	public resolveDeliverySelection(target: AClient) {

		if (this.selectedDeliveryProduct) {
			this.selectedDeliveryProduct.deliverToClient(target);
			return;
		}

		const directDeliveryProduct = this.getDirectDeliveryProduct(target);
		directDeliveryProduct?.directDeliverToClient(target);
	}

	public getDirectDeliveryTarget(product: AProduct) {

		const matchingTargets = this.activeClients.filter((client) => {
			return client.active && client.canReceiveDelivery() && client.matchesProduct(product);
		});

		if (matchingTargets.length !== 1) {
			return undefined;
		}

		return matchingTargets[0];
	}

	public getDirectDeliveryProduct(target: AClient) {

		const matchingProducts = this.children.list
			.filter((child): child is AProduct => child instanceof AProduct)
			.filter((product) => product.canReceiveDirectDelivery() && target.matchesProduct(product));

		if (matchingProducts.length !== 1) {
			return undefined;
		}

		return matchingProducts[0];
	}

	public showYumAt(x: number) {

		const yum = new YumPrefab(this, x, 307);
		this.add.existing(yum);
		yum.setDepth(this.workstation.depth - 1);
	}

	public showCoinsAt(x: number) {

		const coinDropSoundKey = Phaser.Math.Between(0, 1) === 0 ? "coinDrop" : "coinDrop2";
		this.sound.play(coinDropSoundKey);
		const coinOffsets = this.getCoinOffsets(Level.COIN_OFFSETS.length);

		coinOffsets.forEach((offsetX, index) => {
			const coin = new Coin(this, x + offsetX, Level.REWARD_COIN_Y);
			this.add.existing(coin);
			coin.setDepth(this.workstation.depth + 1);
			coin.setScale(0);

			this.time.delayedCall(index * Level.REWARD_COIN_STAGGER, () => {
				if (!coin.active) {
					return;
				}

				this.tweens.add({
					targets: coin,
					scaleX: 1,
					scaleY: 1,
					y: Level.REWARD_COIN_Y - Level.REWARD_COIN_RISE,
					duration: 120,
					ease: "Back.Out",
					onComplete: () => {
						this.tweens.add({
							targets: coin,
								y: Level.REWARD_COIN_LAND_Y,
								duration: Phaser.Math.Between(Level.REWARD_COIN_FALL_DURATION_MIN, Level.REWARD_COIN_FALL_DURATION_MAX),
								ease: "Bounce.Out",
								onComplete: () => {
									this.time.delayedCall(Level.REWARD_COIN_COLLECT_DELAY, () => {
										if (!coin.active) {
											return;
										}

										coin.playCollectAnimation(() => {
											this.addCoins(1);
										});
									});
								}
						});
					}
				});
			});
		});
	}

	public showSpentCoinsAt(x: number, y: number, amount = Level.COIN_OFFSETS.length) {

		const spentCoinCount = Math.min(amount, this.coinCount);

		if (spentCoinCount <= 0) {
			return;
		}

		const startY = this.scale.height + Level.SPENT_COIN_START_OFFSET;
		const peakY = Math.max(
			this.scale.height - (Level.SPENT_COIN_RISE + 40),
			Math.min(y, startY - Level.SPENT_COIN_RISE)
		);
		const endY = this.scale.height + Level.SPENT_COIN_START_OFFSET;
		const coinOffsets = this.getCoinOffsets(spentCoinCount);

		coinOffsets.forEach((offsetX, index) => {
			const coin = new Coin(this, x + offsetX, startY);
			this.add.existing(coin);
			coin.setDepth(this.workstation.depth + 1);
			coin.setScale(0.9);

			this.time.delayedCall(index * Level.REWARD_COIN_STAGGER, () => {
				if (!coin.active) {
					return;
				}

				this.tweens.add({
					targets: coin,
					y: peakY,
					angle: coin.angle + Phaser.Math.Between(-20, 20),
					duration: Level.SPENT_COIN_RISE_DURATION,
					ease: "Cubic.Out",
					onComplete: () => {
						this.tweens.add({
							targets: coin,
							y: endY,
							angle: coin.angle + Phaser.Math.Between(-40, 40),
							duration: Phaser.Math.Between(Level.SPENT_COIN_FALL_DURATION_MIN, Level.SPENT_COIN_FALL_DURATION_MAX),
							ease: "Cubic.In",
							onComplete: () => {
								this.addCoins(-1);
								coin.destroy();
							}
						});
					}
				});
			});
		});
	}

	public respawnClient(previousClient: AClient) {

		this.activeClients = this.activeClients.filter((client) => client !== previousClient && client.active);

		previousClient.destroy();

		if (this.activeClients.length === 0) {
			this.spawnNextClientWave();
		}
	}

	private spawnClient(spawnX = this.getRandomClientSpawnX()) {

		const client = new AClient(this, spawnX, this.clientSpawnY);
		this.add.existing(client);
		this.activeClients.push(client);
		this.placeClientBehindWorkstation(client);
	}

	private spawnInitialClients() {

		for (let index = 0; index < Level.INITIAL_CLIENT_COUNT; index++) {
			this.spawnClient();
		}

		this.hasCompletedFirstClientRound = true;
	}

	private spawnNextClientWave() {

		const clientCount = this.hasCompletedFirstClientRound
			? this.getRandomClientWaveSize()
			: Level.INITIAL_CLIENT_COUNT;

		for (let index = 0; index < clientCount; index++) {
			this.spawnClient();
		}

		this.hasCompletedFirstClientRound = true;
	}

	private getRandomClientWaveSize() {

		const roll = Math.random();

		if (roll < Level.TRIPLE_CLIENT_CHANCE) {
			return 3;
		}

		if (roll < Level.TRIPLE_CLIENT_CHANCE + Level.DOUBLE_CLIENT_CHANCE) {
			return 2;
		}

		return 1;
	}

	private getRandomClientSpawnX() {

		const minX = Level.CLIENT_SIDE_PADDING;
		const maxX = this.scale.width - Level.CLIENT_SIDE_PADDING;
		const occupiedX = this.activeClients.filter((client) => client.active).map((client) => client.x);

		for (let attempt = 0; attempt < 12; attempt++) {
			const candidateX = Phaser.Math.Between(minX, maxX);
			const hasEnoughSpacing = occupiedX.every((x) => Math.abs(x - candidateX) >= Level.CLIENT_MIN_SPACING);

			if (hasEnoughSpacing) {
				return candidateX;
			}
		}

		if (occupiedX.length === 1) {
			return occupiedX[0] < this.scale.width * 0.5 ? maxX : minX;
		}

		return Phaser.Math.Between(minX, maxX);
	}

	private placeClientBehindWorkstation(client: AClient) {

		client.setDepth(this.workstation.depth - 1);
	}

	private setupDipInputs() {

		this.chocolateDip.setInteractive({ useHandCursor: true });
		this.chocolateDip.on(Phaser.Input.Events.POINTER_DOWN, () => {
			this.resolveDipSelection("chocolate");
		});

		this.candyDip.setInteractive({ useHandCursor: true });
		this.candyDip.on(Phaser.Input.Events.POINTER_DOWN, () => {
			this.resolveDipSelection("candy");
		});
	}

	create() {

		this.editorCreate();
		this.initializeCoinCounter();
		this.setupDipInputs();
		this.setupIntroOverlay();
		this.playSceneIntro();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
