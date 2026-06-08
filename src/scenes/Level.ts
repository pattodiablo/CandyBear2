
// You can write more code here

/* START OF COMPILED CODE */

import milkMachine from "./Prefabs/milkMachine";
import milkglass from "./Prefabs/milkglass";
import AProduct from "./Prefabs/AProduct";
import PanelPrefab from "./Prefabs/PanelPrefab";
/* START-USER-IMPORTS */
import Phaser from "phaser";
import AClient from "./Prefabs/AClient";	
import YumPrefab from "./Prefabs/YumPrefab";
import Coin from "./Prefabs/Coin";
import ConfettiPrefab from "./Prefabs/ConfettiPrefab";
import { getStoredTotalCoins, storeCompletedLevel, storeTotalCoins } from "./levelProgress";
import { SkinsAndAnimationBoundsProvider } from "@esotericsoftware/spine-phaser-v4";
import type { MilkSlotId } from "./Prefabs/milkMachine";

interface LevelPlan {
	levelNumber: number;
	difficulty: number;
	oscillation: number;
	waveSizes: number[];
	isTutorial: boolean;
}

interface LevelSceneData {
	levelNumber?: number;
}
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

		// milkmachine
		const milkmachine = new milkMachine(this, 611, 590);
		this.add.existing(milkmachine);

		// toaster
		this.add.image(827, 582, "toaster");

		// fryer1
		const fryer1 = this.add.image(390, 522, "Fryer");

		// fryer2
		const fryer2 = this.add.image(390, 654, "Fryer");

		// holder
		this.add.image(80, 544, "Holder");

		// holder_1
		this.add.image(80, 650, "Holder");

		// holder_2
		this.add.image(210, 650, "Holder");

		// holder_3
		this.add.image(210, 544, "Holder");

		// workplace1
		const workplace1 = this.add.image(1175, 644, "workplace");

		// workplace2
		const workplace2 = this.add.image(1042, 644, "workplace");

		// chocolateDip
		const chocolateDip = this.add.image(1042, 543, "ChocolateDip");

		// candyDip
		const candyDip = this.add.image(1175, 543, "CandyDip");

		// chocolateIcon
		this.add.image(1039, 539, "chocolateIcon");

		// candyicon
		this.add.image(1174, 539, "candyicon");

		// milkGlass
		const milkGlass = new milkglass(this, 210, 536);
		this.add.existing(milkGlass);

		// charola1
		const charola1 = this.add.image(927, 407, "Charola");

		// charola2
		const charola2 = this.add.image(315, 407, "Charola");

		// lamp
		this.add.image(193, 57, "lamp");

		// lamp_1
		this.add.image(1035, 57, "lamp");

		// rawProduct1
		const rawProduct1 = new AProduct(this, 78, 547);
		this.add.existing(rawProduct1);

		// rawProduct_1
		const rawProduct_1 = new AProduct(this, 81, 653, "Product2Raw");
		this.add.existing(rawProduct_1);

		// blurOverlay
		const blurOverlay = this.add.image(0, 0, "blurOverlay");
		blurOverlay.scaleX = 7;
		blurOverlay.scaleY = 4;
		blurOverlay.setOrigin(0, 0);

		// panel
		const panel = new PanelPrefab(this, 595, 360);
		this.add.existing(panel);
		panel.visible = true;

		// bigCoin
		this.add.image(52, 58, "bigCoin");

		this.workstation = workstation;
		this.milkmachine = milkmachine;
		this.fryer1 = fryer1;
		this.fryer2 = fryer2;
		this.workplace1 = workplace1;
		this.workplace2 = workplace2;
		this.chocolateDip = chocolateDip;
		this.candyDip = candyDip;
		this.charola1 = charola1;
		this.charola2 = charola2;
		this.blurOverlay = blurOverlay;
		this.panel = panel;

		this.events.emit("scene-awake");
	}

	private workstation!: Phaser.GameObjects.Image;
	public milkmachine!: milkMachine;
	public fryer1!: Phaser.GameObjects.Image;
	public fryer2!: Phaser.GameObjects.Image;
	public workplace1!: Phaser.GameObjects.Image;
	public workplace2!: Phaser.GameObjects.Image;
	public chocolateDip!: Phaser.GameObjects.Image;
	public candyDip!: Phaser.GameObjects.Image;
	public charola1!: Phaser.GameObjects.Image;
	public charola2!: Phaser.GameObjects.Image;
	private blurOverlay!: Phaser.GameObjects.Image;
	private panel!: PanelPrefab;

	/* START-USER-CODE */
	public static readonly CAMPAIGN_LEVEL_COUNT = 40;
	private static readonly DIFFICULTY_GROWTH = 0.18;
	private static readonly DIFFICULTY_BASE = 0.9;
	private static readonly DIFFICULTY_OSCILLATION_AMPLITUDE = 0.95;
	private static readonly DIFFICULTY_OSCILLATION_FREQUENCY = 0.72;
	private static readonly WAVE_OSCILLATION_FREQUENCY = 1.18;
	private static readonly MAX_WAVE_SIZE = 5;
	private static readonly MAX_WAVE_COUNT = 10;
	private static readonly LEVEL_TWO_TOTAL_CLIENTS = 4;
	private static readonly MAX_TOTAL_CLIENTS = 25;
	private static readonly TOTAL_CLIENT_GROWTH_PER_LEVEL = 0.52;
	private static readonly TOTAL_CLIENT_OSCILLATION_WEIGHT = 0.9;
	private static readonly WAVE_SIZE_GROWTH_FACTOR = 0.4;
	private static readonly WAVE_SIZE_OSCILLATION_BOOST = 0.5;
	private static readonly TRAY_CAPACITY = 3;
	private static readonly TRAY_SLOT_OFFSET = 42;
	private static readonly CAMPAIGN_LEVEL_PLANS = Array.from(
		{ length: Level.CAMPAIGN_LEVEL_COUNT },
		(_, index) => Level.createLevelPlan(index + 1)
	);
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
	private static readonly LEVEL_COMPLETE_CONFETTI_DELAY = 0;
	private static readonly SPENT_COIN_START_OFFSET = 48;
	private static readonly SPENT_COIN_RISE = 100;
	private static readonly SPENT_COIN_RISE_DURATION = 220;
	private static readonly SPENT_COIN_FALL_DURATION_MIN = 280;
	private static readonly SPENT_COIN_FALL_DURATION_MAX = 420;
	public fryer2Enabled = true;
	public workplace2Enabled = true;

	private clientSpawnY = -103;
	private activeClients: AClient[] = [];
	private fryer1Occupied = false;
	private fryer2Occupied = false;
	private workplace1Occupied = false;
	private workplace2Occupied = false;
	private milkRefill1Occupied = false;
	private milkRefill2Occupied = false;
	private charola1Products: AProduct[] = [];
	private charola2Products: AProduct[] = [];
	private selectedDipProduct?: AProduct;
	private selectedDeliveryProduct?: AProduct | milkglass;
	private coinCount = 0;
	private earnedCoinsToday = 0;
	private coinCounterText?: Phaser.GameObjects.Text;
	private backgroundMusic?: Phaser.Sound.BaseSound;
	private selectedLevelNumber = 1;
	private currentLevelPlan: LevelPlan = Level.getLevelPlan(1);
	private currentWaveIndex = 0;
	private hasCelebratedLevelCompletion = false;
	private panelRestY = 0;

	init(data: LevelSceneData = {}) {
		this.resetRuntimeState();
		this.coinCount = getStoredTotalCoins();
		this.earnedCoinsToday = 0;

		this.selectedLevelNumber = Phaser.Math.Clamp(
			Math.floor(data.levelNumber ?? 1),
			1,
			Level.CAMPAIGN_LEVEL_COUNT
		);
		this.currentLevelPlan = Level.getLevelPlan(this.selectedLevelNumber);
		this.currentWaveIndex = 0;
		this.hasCelebratedLevelCompletion = false;
	}

	private resetRuntimeState() {

		this.activeClients = [];
		this.fryer1Occupied = false;
		this.fryer2Occupied = false;
		this.workplace1Occupied = false;
		this.workplace2Occupied = false;
		this.milkRefill1Occupied = false;
		this.milkRefill2Occupied = false;
		this.selectedDipProduct = undefined;
		this.selectedDeliveryProduct = undefined;
	}

	private static createLevelPlan(levelNumber: number): LevelPlan {
		if (levelNumber <= 1) {
			return {
				levelNumber: 1,
				difficulty: 0.85,
				oscillation: 0,
				waveSizes: [1],
				isTutorial: true
			};
		}

		if (levelNumber === 2) {
			return {
				levelNumber: 2,
				difficulty: 1.35,
				oscillation: Number(Math.sin(Level.DIFFICULTY_OSCILLATION_FREQUENCY).toFixed(3)),
				waveSizes: [2, 2],
				isTutorial: false
			};
		}

		const normalizedLevel = Math.max(2, Math.floor(levelNumber));
		const oscillation = Math.sin((normalizedLevel - 1) * Level.DIFFICULTY_OSCILLATION_FREQUENCY);
		const difficulty = Number((
			Level.DIFFICULTY_BASE
			+ (normalizedLevel * Level.DIFFICULTY_GROWTH)
			+ (oscillation * Level.DIFFICULTY_OSCILLATION_AMPLITUDE)
		).toFixed(2));
		const totalClientsTarget = Phaser.Math.Clamp(
			Math.round(
				Level.LEVEL_TWO_TOTAL_CLIENTS
				+ ((normalizedLevel - 2) * Level.TOTAL_CLIENT_GROWTH_PER_LEVEL)
				+ (difficulty * 0.7)
				+ (Math.max(0, oscillation) * Level.TOTAL_CLIENT_OSCILLATION_WEIGHT)
			),
			Level.LEVEL_TWO_TOTAL_CLIENTS,
			Level.MAX_TOTAL_CLIENTS
		);
		// Effective max wave size grows from 3 toward 5 driven by difficulty and oscillation
		const difficultyWaveSizeBoost = Math.max(0, difficulty - 1.0) * Level.WAVE_SIZE_GROWTH_FACTOR;
		const oscillationWaveSizeBoost = Math.max(0, oscillation) * Level.WAVE_SIZE_OSCILLATION_BOOST;
		const effectiveMaxWaveSize = Phaser.Math.Clamp(
			Math.round(3 + difficultyWaveSizeBoost + oscillationWaveSizeBoost),
			3,
			Level.MAX_WAVE_SIZE
		);
		const minimumWaveCount = Math.ceil(totalClientsTarget / effectiveMaxWaveSize);
		const waveCount = Phaser.Math.Clamp(
			Math.max(
				minimumWaveCount,
				Math.round(2 + ((normalizedLevel - 2) * 0.08) + (Math.max(0, oscillation) * 1.2))
			),
			Math.max(2, minimumWaveCount),
			Math.min(Level.MAX_WAVE_COUNT, totalClientsTarget)
		);
		const waveSizes: number[] = Array.from({ length: waveCount }, () => 1);
		let remainingClients = totalClientsTarget - waveCount;
		let distributionStep = Math.round(Math.abs(oscillation) * waveCount);

		while (remainingClients > 0) {
			let distributedClient = false;

			for (let offset = 0; offset < waveCount && remainingClients > 0; offset++) {
				const waveIndex = (distributionStep + offset) % waveCount;

				if (waveSizes[waveIndex] >= effectiveMaxWaveSize) {
					continue;
				}

				waveSizes[waveIndex]++;
				remainingClients--;
				distributedClient = true;
			}

			if (!distributedClient) {
				break;
			}

			distributionStep++;
		}

		return {
			levelNumber: normalizedLevel,
			difficulty,
			oscillation: Number(oscillation.toFixed(3)),
			waveSizes,
			isTutorial: false
		};
	}

	private static getLevelPlan(levelNumber: number): LevelPlan {
		const clampedLevel = Phaser.Math.Clamp(levelNumber, 1, Level.CAMPAIGN_LEVEL_COUNT);
		const sourcePlan = Level.CAMPAIGN_LEVEL_PLANS[clampedLevel - 1];
		return {
			...sourcePlan,
			waveSizes: [...sourcePlan.waveSizes]
		};
	}

	private applyLevelPlanToIntroPanel() {

		this.panel.setDayLabel(`Day ${this.currentLevelPlan.levelNumber}`);
	}

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
		this.panel.showIntroState();
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

		const nextCoinCount = Math.max(0, this.coinCount + amount);
		const appliedDelta = nextCoinCount - this.coinCount;

		this.coinCount = nextCoinCount;

		if (appliedDelta > 0) {
			this.earnedCoinsToday += appliedDelta;
		}

		storeTotalCoins(this.coinCount);
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

	public claimAvailableMilkSlot() {

		if (!this.milkRefill1Occupied) {
			this.milkRefill1Occupied = true;
			return {
				id: "milkRefill1" as MilkSlotId,
				target: this.milkmachine.getSlotTarget("milkRefill1")
			};
		}

		if (!this.milkRefill2Occupied) {
			this.milkRefill2Occupied = true;
			return {
				id: "milkRefill2" as MilkSlotId,
				target: this.milkmachine.getSlotTarget("milkRefill2")
			};
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

	public releaseMilkSlot(slotId?: MilkSlotId) {

		if (slotId === "milkRefill1") {
			this.milkRefill1Occupied = false;
			this.milkmachine.clearSlot("milkRefill1");
			return;
		}

		if (slotId === "milkRefill2") {
			this.milkRefill2Occupied = false;
			this.milkmachine.clearSlot("milkRefill2");
		}
	}

	public reserveTraySlot(trayId: "charola1" | "charola2", product: AProduct) {
		const arr = trayId === "charola1" ? this.charola1Products : this.charola2Products;
		if (arr.includes(product)) {
			return;
		}
		if (arr.length >= Level.TRAY_CAPACITY) {
			return;
		}
		arr.push(product);
		this.reflowTrayProducts(trayId);
	}

	public releaseTraySlot(trayId: "charola1" | "charola2", product: AProduct) {
		const arr = trayId === "charola1" ? this.charola1Products : this.charola2Products;
		const idx = arr.indexOf(product);
		if (idx === -1) {
			return;
		}
		arr.splice(idx, 1);
		this.reflowTrayProducts(trayId);
	}

	private reflowTrayProducts(trayId: "charola1" | "charola2") {
		const arr = trayId === "charola1" ? this.charola1Products : this.charola2Products;
		const tray = trayId === "charola1" ? this.charola1 : this.charola2;
		if (!tray) {
			return;
		}
		const baseX = tray.x;
		const baseY = tray.y + 8;
		const offsets = [] as number[];
		if (arr.length === 1) {
			offsets.push(0);
		} else if (arr.length === 2) {
			offsets.push(-Level.TRAY_SLOT_OFFSET / 2, Level.TRAY_SLOT_OFFSET / 2);
		} else {
			offsets.push(-Level.TRAY_SLOT_OFFSET, 0, Level.TRAY_SLOT_OFFSET);
		}

		for (let i = 0; i < arr.length; i++) {
			const prod = arr[i];
			const x = baseX + (offsets[i] ?? 0);
			const y = baseY;
			prod.snapToTraySlot(trayId, x, y);
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

	public beginDeliverySelection(product: AProduct | milkglass) {

		if (this.selectedDeliveryProduct && this.selectedDeliveryProduct !== product) {
			this.selectedDeliveryProduct.cancelDeliverySelection();
		}

		this.selectedDeliveryProduct = product;
	}

	public clearDeliverySelection(product?: AProduct | milkglass) {

		if (!product || this.selectedDeliveryProduct === product) {
			this.selectedDeliveryProduct = undefined;
		}
	}

	public hasSelectedDelivery() {

		return !!this.selectedDeliveryProduct;
	}

	public resolveDeliverySelection(target: AClient) {

		if (this.selectedDeliveryProduct) {
			this.selectedDeliveryProduct.deliverToClient(target);
			return;
		}

		const directDeliveryProduct = this.getDirectDeliveryProduct(target);
		directDeliveryProduct?.directDeliverToClient(target);
	}

	public getDirectDeliveryTarget(product: AProduct | milkglass) {

		const matchingTargets = this.activeClients.filter((client) => {
			return client.active && client.canReceiveDelivery() && client.matchesProduct(product);
		});

		if (matchingTargets.length === 0) {
			return undefined;
		}

		matchingTargets.sort((left, right) => {
			return left.getRemainingRequestTime() - right.getRemainingRequestTime();
		});

		return matchingTargets[0];
	}

	public getDirectDeliveryProduct(target: AClient) {

		const matchingProducts = this.children.list
			.filter((child): child is AProduct | milkglass => child instanceof AProduct || child instanceof milkglass)
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
		return yum;
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

	public respawnClient(previousClient: AClient, finalYum?: YumPrefab) {

		this.activeClients = this.activeClients.filter((client) => client !== previousClient && client.active);

		previousClient.destroy();

		if (this.activeClients.length === 0) {
			if (this.hasMoreClientWaves()) {
				this.spawnNextClientWave();
				return;
			}

			this.handleLevelCleared(finalYum);
		}
	}

	private hasMoreClientWaves() {
		return this.currentWaveIndex < this.currentLevelPlan.waveSizes.length - 1;
	}

	private handleLevelCleared(finalYum?: YumPrefab) {
		if (this.hasCelebratedLevelCompletion) {
			return;
		}

		this.hasCelebratedLevelCompletion = true;
		storeTotalCoins(this.coinCount);
		storeCompletedLevel(this.currentLevelPlan.levelNumber);
		if (finalYum) {
			finalYum.once(Phaser.GameObjects.Events.DESTROY, () => {
				this.time.delayedCall(Level.LEVEL_COMPLETE_CONFETTI_DELAY, () => {
					if (!this.sys.isActive()) {
						return;
					}

					ConfettiPrefab.launch(this);
					this.playLevelCompletePanel();
				});
			});
			return;
		}

		// No finalYum provided — complete level immediately
		ConfettiPrefab.launch(this);
		this.playLevelCompletePanel();
	}

	private playLevelCompletePanel() {
		const panelStartY = -this.panel.displayHeight - Level.INTRO_PANEL_START_OFFSET;
		const nextLevelNumber = Phaser.Math.Clamp(
			this.currentLevelPlan.levelNumber + 1,
			1,
			Level.CAMPAIGN_LEVEL_COUNT
		);

		this.blurOverlay.setVisible(true);
		this.blurOverlay.setAlpha(0);
		this.blurOverlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.scale.width, this.scale.height), Phaser.Geom.Rectangle.Contains);
		this.panel.setVisible(true);
		this.panel.setAlpha(1);
		this.panel.y = panelStartY;
		this.panel.setEarnedTodayTotal(this.earnedCoinsToday);
		this.panel.showFinalState(() => {
			if (this.currentLevelPlan.levelNumber >= Level.CAMPAIGN_LEVEL_COUNT) {
				this.scene.start("SceneSelector");
				return;
			}

			this.scene.start("Level", { levelNumber: nextLevelNumber });
		});

		this.tweens.add({
			targets: this.blurOverlay,
			alpha: 1,
			duration: Level.INTRO_OVERLAY_FADE_IN_DURATION,
			ease: "Quad.Out"
		});

		this.tweens.add({
			targets: this.panel,
			y: this.panelRestY,
			duration: Level.INTRO_PANEL_DROP_DURATION,
			ease: "Bounce.Out"
		});
	}

	private spawnClient(spawnX = this.getRandomClientSpawnX()) {

		const client = new AClient(this, spawnX, this.clientSpawnY);
		this.add.existing(client);
		this.activeClients.push(client);
		this.placeClientBehindWorkstation(client);
	}

	private spawnInitialClients() {
		this.currentWaveIndex = 0;
		this.spawnCurrentWave();
	}

	private spawnNextClientWave() {
		if (this.currentWaveIndex >= this.currentLevelPlan.waveSizes.length - 1) {
			return;
		}

		this.currentWaveIndex++;
		this.spawnCurrentWave();
	}

	private spawnCurrentWave() {
		const clientCount = this.currentLevelPlan.waveSizes[this.currentWaveIndex] ?? 0;

		for (let index = 0; index < clientCount; index++) {
			this.spawnClient();
		}
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
		this.panelRestY = this.panel.y;
		this.applyLevelPlanToIntroPanel();
		this.initializeCoinCounter();
		this.setupDipInputs();
		this.setupIntroOverlay();
		this.playSceneIntro();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
