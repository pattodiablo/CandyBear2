
// You can write more code here

/* START OF COMPILED CODE */

import milkMachine from "./Prefabs/milkMachine";
import ToasterPrefab from "./Prefabs/ToasterPrefab";
import milkglass from "./Prefabs/milkglass";
import AProduct from "./Prefabs/AProduct";
import PanelPrefab from "./Prefabs/PanelPrefab";
import sandwichPrefab from "./Prefabs/sandwichPrefab";
/* START-USER-IMPORTS */
import Phaser from "phaser";
import AClient from "./Prefabs/AClient";	
import YumPrefab from "./Prefabs/YumPrefab";
import Coin from "./Prefabs/Coin";
import ConfettiPrefab from "./Prefabs/ConfettiPrefab";
import { getStoredTotalCoins, storeCompletedLevel, storeLevelStars, storeTotalCoins } from "./levelProgress";
import { SkinsAndAnimationBoundsProvider } from "@esotericsoftware/spine-phaser-v4";
import type { MilkSlotId } from "./Prefabs/milkMachine";
import type { ToasterSlotId } from "./Prefabs/ToasterPrefab";
import type { LevelStarPerformance } from "./Prefabs/PanelPrefab";

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
		const toaster = new ToasterPrefab(this, 827, 582);
		this.add.existing(toaster);

		// fryer1
		const fryer1 = this.add.image(390, 523, "Fryer");

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

		// sandwichProduct
		const sandwichProduct = new sandwichPrefab(this, 209, 651);
		this.add.existing(sandwichProduct);

		// menuBtn
		const menuBtn = this.add.image(1229, 47, "menuBtn");

		this.workstation = workstation;
		this.milkmachine = milkmachine;
		this.toaster = toaster;
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
		this.menuBtn = menuBtn;

		this.events.emit("scene-awake");
	}

	private workstation!: Phaser.GameObjects.Image;
	public milkmachine!: milkMachine;
	public toaster!: ToasterPrefab;
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
	private menuBtn!: Phaser.GameObjects.Image;

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
	private static readonly MAX_ACTIVE_CLIENTS = 5;
	private static readonly CLIENT_SPAWN_SLOT_COUNT = 5;
	private static readonly CLIENT_SPAWN_RETRY_DELAY = 350;
	private static readonly IMMEDIATE_CLIENT_STAGGER = 300;
	private static readonly IMMEDIATE_CLIENT_JITTER_MAX = 2000;
	private static readonly DELAYED_CLIENT_MIN_DELAY = 4000;
	private static readonly DELAYED_CLIENT_MAX_DELAY = 5000;
	private static readonly DELAYED_CLIENT_STAGGER = 350;
	private static readonly DAY_INDICATOR_CENTER_OFFSET_X = 100;
	private static readonly DAY_INDICATOR_Y = 40;
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
	private toasterSlotOccupied = false;
	private charola1Products: AProduct[] = [];
	private charola2Products: AProduct[] = [];
	private selectedDipProduct?: AProduct;
	private selectedDeliveryProduct?: AProduct | milkglass | sandwichPrefab;
	private coinCount = 0;
	private earnedCoinsToday = 0;
	private coinCounterText?: Phaser.GameObjects.Text;
	private dayIndicatorLabel?: Phaser.GameObjects.Text;
	private dayIndicatorNumber?: Phaser.GameObjects.Text;
	private clientsLeftLabel?: Phaser.GameObjects.Text;
	private clientsLeftNumber?: Phaser.GameObjects.Text;
	private clientsRemainingInLevel = 0;
	private backgroundMusic?: Phaser.Sound.BaseSound;
	private selectedLevelNumber = 1;
	private currentLevelPlan: LevelPlan = Level.getLevelPlan(1);
	private currentWaveIndex = 0;
	private hasCelebratedLevelCompletion = false;
	private panelRestY = 0;
	private successfulClientsServed = 0;
	private discardedProductLosses = 0;
	private scheduledWaveClients = 0;
	private queuedClientEntries = 0;
	private waveSpawnTimers: Phaser.Time.TimerEvent[] = [];
	private clientSpawnRetryTimer?: Phaser.Time.TimerEvent;
	private exitConfirmContainer?: Phaser.GameObjects.Container;
	private exitConfirmYesButton?: Phaser.GameObjects.Container;
	private exitConfirmNoButton?: Phaser.GameObjects.Container;
	private isExitConfirmVisible = false;
	private isGameplayPaused = false;
	private savedGameplayTimeScale = 1;
	private static readonly EXIT_CONFIRM_DEPTH = 1002;
	private static readonly MENU_BUTTON_DEPTH_OFFSET = 11;
	private static readonly EXIT_BUTTON_PADDING_X = 32;
	private static readonly EXIT_BUTTON_PADDING_Y = 10;
	private static readonly EXIT_BUTTON_CORNER_RADIUS = 18;
	private static readonly EXIT_BUTTON_STROKE_WIDTH = 4;
	private static readonly EXIT_BUTTON_TEXT_COLOR = "#ffffff";
	private static readonly EXIT_BUTTON_YES_Y = 22;
	private static readonly EXIT_BUTTON_NO_Y = 122;

	init(data: LevelSceneData = {}) {

		this.events.off(Phaser.Scenes.Events.SHUTDOWN, this.flushLoadedContent, this);
		this.events.on(Phaser.Scenes.Events.SHUTDOWN, this.flushLoadedContent, this);

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
		this.isGameplayPaused = false;
		this.savedGameplayTimeScale = 1;
		this.time.timeScale = 1;
		this.resetRuntimeState();
	}

	private resetRuntimeState() {

		for (const client of this.activeClients) {
			if (client.active) {
				client.destroy();
			}
		}

		this.activeClients = [];
		this.charola1Products = [];
		this.charola2Products = [];
		this.fryer1Occupied = false;
		this.fryer2Occupied = false;
		this.workplace1Occupied = false;
		this.workplace2Occupied = false;
		this.milkRefill1Occupied = false;
		this.milkRefill2Occupied = false;
		this.toasterSlotOccupied = false;
		this.selectedDipProduct = undefined;
		this.selectedDeliveryProduct = undefined;
		this.successfulClientsServed = 0;
		this.discardedProductLosses = 0;
		this.scheduledWaveClients = 0;
		this.queuedClientEntries = 0;
		this.isExitConfirmVisible = false;
		this.isGameplayPaused = false;
		this.savedGameplayTimeScale = 1;
		this.clientsRemainingInLevel = this.getLevelClientCount();
		this.clearWaveSpawnTimers();
	}

	private clearHudReferences() {

		this.coinCounterText = undefined;
		this.dayIndicatorLabel = undefined;
		this.dayIndicatorNumber = undefined;
		this.clientsLeftLabel = undefined;
		this.clientsLeftNumber = undefined;
		this.exitConfirmContainer = undefined;
		this.exitConfirmYesButton = undefined;
		this.exitConfirmNoButton = undefined;
	}

	private flushLoadedContent() {

		this.clearHudReferences();
		this.clearWaveSpawnTimers();

		for (const client of this.activeClients) {
			if (client.active) {
				client.destroy();
			}
		}

		this.activeClients = [];

		if (this.backgroundMusic) {
			this.backgroundMusic.stop();
			this.backgroundMusic.destroy();
			this.backgroundMusic = undefined;
		}

		this.tweens.killAll();
		this.time.removeAllEvents();
		this.time.timeScale = 1;
		this.children.removeAll(true);

		this.charola1Products = [];
		this.charola2Products = [];
		this.fryer1Occupied = false;
		this.fryer2Occupied = false;
		this.workplace1Occupied = false;
		this.workplace2Occupied = false;
		this.milkRefill1Occupied = false;
		this.milkRefill2Occupied = false;
		this.toasterSlotOccupied = false;
		this.selectedDipProduct = undefined;
		this.selectedDeliveryProduct = undefined;
		this.isExitConfirmVisible = false;
		this.isGameplayPaused = false;
	}

	public recordSuccessfulDelivery() {
		this.successfulClientsServed++;
	}

	public recordProductDiscardLoss() {
		this.discardedProductLosses++;
	}

	public showProductDiscardLossAt(x: number, y: number, amount = Level.COIN_OFFSETS.length) {
		this.recordProductDiscardLoss();
		this.showSpentCoinsAt(x, y, amount);
	}

	private getLevelClientCount() {
		return this.currentLevelPlan.waveSizes.reduce((total, waveSize) => total + waveSize, 0);
	}

	private getStarPerformance(): LevelStarPerformance {
		return {
			successfulClients: this.successfulClientsServed,
			totalClients: this.getLevelClientCount(),
			discardedProductLosses: this.discardedProductLosses,
		};
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

	private getHudTextStyle(color: string) {

		return {
			color,
			fontFamily: "Klop",
			fontSize: "40px",
			fontStyle: "bold",
			stroke: "#fff8f3",
			strokeThickness: 6,
		};
	}

	private initializeCoinCounter() {

		this.coinCounterText = this.add.text(90, Level.DAY_INDICATOR_Y, "0", this.getHudTextStyle("#2D120B"));
		this.coinCounterText.setOrigin(0, 0.5);
		this.coinCounterText.setScrollFactor(0);
		this.coinCounterText.setDepth(this.workstation.depth + 10);
		this.updateCoinCounter();
	}

	private initializeDayIndicator() {

		this.dayIndicatorLabel = this.add.text(0, Level.DAY_INDICATOR_Y, "Day ", this.getHudTextStyle("#FD7CB6"));
		this.dayIndicatorNumber = this.add.text(0, Level.DAY_INDICATOR_Y, String(this.currentLevelPlan.levelNumber), this.getHudTextStyle("#2D120B"));
		this.dayIndicatorLabel.setOrigin(0, 0.5);
		this.dayIndicatorNumber.setOrigin(0, 0.5);
		this.layoutHudLabelPair(
			this.dayIndicatorLabel,
			this.dayIndicatorNumber,
			(this.scale.width * 0.5) - Level.DAY_INDICATOR_CENTER_OFFSET_X
		);

		for (const dayText of [this.dayIndicatorLabel, this.dayIndicatorNumber]) {
			dayText.setScrollFactor(0);
			dayText.setDepth(this.workstation.depth + 10);
		}
	}

	private initializeClientsLeftIndicator() {

		this.clientsLeftLabel = this.add.text(0, Level.DAY_INDICATOR_Y, "Left: ", this.getHudTextStyle("#FD7CB6"));
		this.clientsLeftNumber = this.add.text(0, Level.DAY_INDICATOR_Y, "0", this.getHudTextStyle("#2D120B"));
		this.clientsLeftLabel.setOrigin(0, 0.5);
		this.clientsLeftNumber.setOrigin(0, 0.5);

		for (const clientsLeftText of [this.clientsLeftLabel, this.clientsLeftNumber]) {
			clientsLeftText.setScrollFactor(0);
			clientsLeftText.setDepth(this.workstation.depth + 10);
		}

		this.syncClientsRemainingInLevel();
	}

	private syncClientsRemainingInLevel() {

		this.clientsRemainingInLevel = this.getLevelClientCount();
		this.updateClientsLeftIndicator();
	}

	private layoutHudLabelPair(label: Phaser.GameObjects.Text, value: Phaser.GameObjects.Text, anchorX: number) {

		const totalWidth = label.width + value.width;
		label.setX(anchorX - (totalWidth * 0.5));
		value.setX(label.x + label.width);
	}

	private updateClientsLeftIndicator() {

		if (!this.clientsLeftLabel?.scene || !this.clientsLeftNumber?.scene) {
			return;
		}

		this.clientsLeftNumber.setText(String(this.clientsRemainingInLevel));
		this.layoutHudLabelPair(
			this.clientsLeftLabel,
			this.clientsLeftNumber,
			(this.scale.width * 0.5) + Level.DAY_INDICATOR_CENTER_OFFSET_X
		);
	}

	private completeLevelClient() {

		this.clientsRemainingInLevel = Math.max(0, this.clientsRemainingInLevel - 1);
		this.updateClientsLeftIndicator();
	}

	private setupMenuButton() {

		this.menuBtn.setScrollFactor(0);
		this.menuBtn.setDepth(this.workstation.depth + Level.MENU_BUTTON_DEPTH_OFFSET);
		this.menuBtn.setInteractive({ useHandCursor: true });

		this.menuBtn.on(Phaser.Input.Events.POINTER_OVER, () => {
			this.menuBtn.setScale(1.08);
		});

		this.menuBtn.on(Phaser.Input.Events.POINTER_OUT, () => {
			this.menuBtn.setScale(1);
		});

		this.menuBtn.on(Phaser.Input.Events.POINTER_DOWN, () => {
			if (this.isExitConfirmVisible) {
				return;
			}

			this.menuBtn.setScale(0.95);
			this.showExitConfirmation();
		});
	}

	private createExitConfirmationUi() {

		const centerX = this.scale.width * 0.5;
		const centerY = this.scale.height * 0.5;
		const container = this.add.container(centerX, centerY);

		const background = this.add.image(0, 0, "dayOneLabel");
		background.setScale(0.75);
		container.add(background);

		const message = this.add.text(0, -70, "Are you sure\nto exit?", {
			color: "#DF3D7A",
			fontFamily: "Klop",
			fontSize: "42px",
			fontStyle: "bold",
			align: "center",
			stroke: "#fff8f3",
			strokeThickness: 6,
		});
		message.setOrigin(0.5);
		container.add(message);

		this.exitConfirmYesButton = this.createExitDialogButton(0, Level.EXIT_BUTTON_YES_Y, "Yes");
		this.exitConfirmNoButton = this.createExitDialogButton(0, Level.EXIT_BUTTON_NO_Y, "No");
		container.add([this.exitConfirmYesButton, this.exitConfirmNoButton]);

		container.setScrollFactor(0);
		container.setDepth(Level.EXIT_CONFIRM_DEPTH);
		container.setVisible(false);
		container.setAlpha(0);
		this.exitConfirmContainer = container;
	}

	private createExitDialogButton(x: number, y: number, label: string) {

		const container = this.add.container(x, y);
		const labelText = this.add.text(0, 0, label, {
			color: Level.EXIT_BUTTON_TEXT_COLOR,
			fontFamily: "Klop",
			fontSize: "44px",
			fontStyle: "bold",
			stroke: "#3E0307",
			strokeThickness: 4,
		});
		labelText.setOrigin(0.5);

		const buttonWidth = labelText.width + (Level.EXIT_BUTTON_PADDING_X * 2);
		const buttonHeight = labelText.height + (Level.EXIT_BUTTON_PADDING_Y * 2);
		const halfButtonWidth = buttonWidth * 0.5;
		const halfButtonHeight = buttonHeight * 0.5;
		const strokeInset = Level.EXIT_BUTTON_STROKE_WIDTH * 0.5;
		const fillRadius = Math.max(0, Level.EXIT_BUTTON_CORNER_RADIUS - strokeInset);
		const background = this.add.graphics();
		background.fillStyle(0xFD7DB6, 1);
		background.fillRoundedRect(
			-halfButtonWidth + strokeInset,
			-halfButtonHeight + strokeInset,
			buttonWidth - Level.EXIT_BUTTON_STROKE_WIDTH,
			buttonHeight - Level.EXIT_BUTTON_STROKE_WIDTH,
			fillRadius
		);
		background.lineStyle(Level.EXIT_BUTTON_STROKE_WIDTH, 0xffffff, 1);
		background.strokeRoundedRect(
			-halfButtonWidth,
			-halfButtonHeight,
			buttonWidth,
			buttonHeight,
			Level.EXIT_BUTTON_CORNER_RADIUS
		);

		container.add([background, labelText]);
		container.setSize(buttonWidth, buttonHeight);
		container.setInteractive({ useHandCursor: true });

		return container;
	}

	private bindExitConfirmationButtons() {

		if (!this.exitConfirmYesButton || !this.exitConfirmNoButton) {
			return;
		}

		for (const button of [this.exitConfirmYesButton, this.exitConfirmNoButton]) {
			button.setScale(1);
			button.setInteractive({ useHandCursor: true });
			button.removeAllListeners();
		}

		this.exitConfirmYesButton.on(Phaser.Input.Events.POINTER_OVER, () => {
			this.exitConfirmYesButton?.setScale(1.06);
		});
		this.exitConfirmYesButton.on(Phaser.Input.Events.POINTER_OUT, () => {
			this.exitConfirmYesButton?.setScale(1);
		});
		this.exitConfirmYesButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
			this.exitConfirmYesButton?.setScale(0.94);
			this.confirmExitToSceneSelector();
		});

		this.exitConfirmNoButton.on(Phaser.Input.Events.POINTER_OVER, () => {
			this.exitConfirmNoButton?.setScale(1.06);
		});
		this.exitConfirmNoButton.on(Phaser.Input.Events.POINTER_OUT, () => {
			this.exitConfirmNoButton?.setScale(1);
		});
		this.exitConfirmNoButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
			this.exitConfirmNoButton?.setScale(0.94);
			this.hideExitConfirmation();
		});
	}

	private pauseGameplay() {

		if (this.isGameplayPaused) {
			return;
		}

		this.isGameplayPaused = true;
		this.savedGameplayTimeScale = this.time.timeScale;
		this.time.timeScale = 0;

		if (this.backgroundMusic?.isPlaying) {
			this.backgroundMusic.pause();
		}
	}

	private resumeGameplay() {

		if (!this.isGameplayPaused) {
			return;
		}

		this.isGameplayPaused = false;
		this.time.timeScale = this.savedGameplayTimeScale;

		if (this.backgroundMusic && !this.backgroundMusic.isPlaying) {
			this.backgroundMusic.resume();
		}
	}

	private showExitConfirmation() {

		if (this.isExitConfirmVisible) {
			return;
		}

		if (!this.exitConfirmContainer) {
			this.createExitConfirmationUi();
		}

		this.pauseGameplay();
		this.isExitConfirmVisible = true;
		this.bindExitConfirmationButtons();
		this.menuBtn.setScale(1);

		this.blurOverlay.setVisible(true);
		this.blurOverlay.setAlpha(1);
		this.blurOverlay.setInteractive(
			new Phaser.Geom.Rectangle(0, 0, this.scale.width, this.scale.height),
			Phaser.Geom.Rectangle.Contains
		);
		this.exitConfirmContainer!.setVisible(true);
		this.exitConfirmContainer!.setAlpha(1);
	}

	private hideExitConfirmation() {

		if (!this.isExitConfirmVisible || !this.exitConfirmContainer) {
			return;
		}

		this.isExitConfirmVisible = false;
		this.exitConfirmYesButton?.disableInteractive();
		this.exitConfirmNoButton?.disableInteractive();
		this.exitConfirmContainer.setVisible(false);
		this.exitConfirmContainer.setAlpha(0);
		this.exitConfirmYesButton?.setScale(1);
		this.exitConfirmNoButton?.setScale(1);
		this.resumeGameplay();

		if (!this.panel.visible) {
			this.tweens.add({
				targets: this.blurOverlay,
				alpha: 0,
				duration: Level.INTRO_OVERLAY_FADE_OUT_DURATION,
				ease: "Quad.InOut",
				onComplete: () => {
					this.blurOverlay.disableInteractive();
					this.blurOverlay.setVisible(false);
				},
			});
		}
	}

	private confirmExitToSceneSelector() {

		this.backgroundMusic?.stop();
		this.scene.start("SceneSelector");
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

	public claimAvailableToasterSlot() {

		if (!this.toasterSlotOccupied) {
			this.toasterSlotOccupied = true;
			return {
				id: "toasterSlot1" as ToasterSlotId,
				target: this.toaster.getSlotTarget("toasterSlot1")
			};
		}

		return null;
	}

	public releaseToasterSlot(slotId?: ToasterSlotId) {

		if (slotId === "toasterSlot1") {
			this.toasterSlotOccupied = false;
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

	public beginDeliverySelection(product: AProduct | milkglass | sandwichPrefab) {

		if (this.selectedDeliveryProduct && this.selectedDeliveryProduct !== product) {
			this.selectedDeliveryProduct.cancelDeliverySelection();
		}

		this.selectedDeliveryProduct = product;
	}

	public clearDeliverySelection(product?: AProduct | milkglass | sandwichPrefab) {

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

	public getDirectDeliveryTarget(product: AProduct | milkglass | sandwichPrefab) {

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
			.filter((child): child is AProduct | milkglass | sandwichPrefab => child instanceof AProduct || child instanceof milkglass || child instanceof sandwichPrefab)
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
		this.completeLevelClient();

		this.processClientEntryQueue();

		if (this.activeClients.length === 0 && this.getPendingWaveSpawns() === 0) {
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
		storeLevelStars(
			this.currentLevelPlan.levelNumber,
			PanelPrefab.calculateEarnedStars(this.getStarPerformance())
		);
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
		this.panel.prepareFinalState();

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
			ease: "Bounce.Out",
			onComplete: () => {
				this.panel.showFinalState(
					this.getStarPerformance(),
					() => {
						if (this.currentLevelPlan.levelNumber >= Level.CAMPAIGN_LEVEL_COUNT) {
							this.scene.start("SceneSelector");
							return;
						}

						this.scene.start("Level", { levelNumber: nextLevelNumber });
					}
				);
			}
		});
	}

	private spawnClient(spawnX: number) {

		const client = new AClient(this, spawnX, this.clientSpawnY);
		this.add.existing(client);
		this.activeClients.push(client);
		this.placeClientBehindWorkstation(client);
	}

	private getActiveClientCount() {

		return this.activeClients.filter((client) => client.active).length;
	}

	private getPendingWaveSpawns() {

		return this.scheduledWaveClients + this.queuedClientEntries;
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

		this.clearWaveSpawnTimers();
		const clientCount = this.currentLevelPlan.waveSizes[this.currentWaveIndex] ?? 0;

		if (clientCount <= 0) {
			return;
		}

		const shuffledIndices = Phaser.Utils.Array.Shuffle(Array.from({ length: clientCount }, (_, index) => index));
		const delayedCount = this.getDelayedClientCount(clientCount);
		const delayedIndices = new Set(shuffledIndices.slice(0, delayedCount));
		const immediateOrder = new Map(
			shuffledIndices
				.filter((index) => !delayedIndices.has(index))
				.map((index, order) => [index, order] as const)
		);

		this.scheduledWaveClients = clientCount;
		this.queuedClientEntries = 0;

		for (let index = 0; index < clientCount; index++) {
			const delay = delayedIndices.has(index)
				? this.getDelayedClientSpawnDelay(index)
				: this.getImmediateClientSpawnDelay(immediateOrder.get(index) ?? 0);

			const timer = this.time.delayedCall(delay, () => {
				this.onWaveClientScheduled();
			});
			this.waveSpawnTimers.push(timer);
		}
	}

	private onWaveClientScheduled() {

		if (this.scheduledWaveClients <= 0) {
			return;
		}

		this.scheduledWaveClients--;
		this.queuedClientEntries++;
		this.processClientEntryQueue();
	}

	private processClientEntryQueue() {

		while (
			this.queuedClientEntries > 0
			&& this.getActiveClientCount() < Level.MAX_ACTIVE_CLIENTS
		) {
			const spawnX = this.getAvailableClientSpawnX();

			if (spawnX === null) {
				break;
			}

			this.queuedClientEntries--;
			this.spawnClient(spawnX);
		}

		if (this.queuedClientEntries > 0) {
			this.scheduleClientSpawnRetry();
		}
	}

	private scheduleClientSpawnRetry() {

		if (this.clientSpawnRetryTimer) {
			return;
		}

		this.clientSpawnRetryTimer = this.time.delayedCall(Level.CLIENT_SPAWN_RETRY_DELAY, () => {
			this.clientSpawnRetryTimer = undefined;
			this.processClientEntryQueue();
		});
	}

	private getDelayedClientCount(clientCount: number) {

		if (clientCount <= 1) {
			return 0;
		}

		const maxDelayed = Math.max(1, Math.floor(clientCount / 2));
		return Phaser.Math.Between(1, maxDelayed);
	}

	private getImmediateClientSpawnDelay(order: number) {

		return (order * Level.IMMEDIATE_CLIENT_STAGGER)
			+ Phaser.Math.Between(0, Level.IMMEDIATE_CLIENT_JITTER_MAX);
	}

	private getDelayedClientSpawnDelay(index: number) {

		return Phaser.Math.Between(Level.DELAYED_CLIENT_MIN_DELAY, Level.DELAYED_CLIENT_MAX_DELAY)
			+ (index * Level.DELAYED_CLIENT_STAGGER);
	}

	private clearWaveSpawnTimers() {

		this.waveSpawnTimers.forEach((timer) => {
			timer.remove(false);
		});
		this.waveSpawnTimers = [];
		this.clientSpawnRetryTimer?.remove(false);
		this.clientSpawnRetryTimer = undefined;
		this.scheduledWaveClients = 0;
		this.queuedClientEntries = 0;
	}

	private getClientSpawnSlots() {

		const minX = Level.CLIENT_SIDE_PADDING;
		const maxX = this.scale.width - Level.CLIENT_SIDE_PADDING;

		if (Level.CLIENT_SPAWN_SLOT_COUNT <= 1) {
			return [Math.round((minX + maxX) * 0.5)];
		}

		return Array.from({ length: Level.CLIENT_SPAWN_SLOT_COUNT }, (_, index) => {
			const progress = index / (Level.CLIENT_SPAWN_SLOT_COUNT - 1);
			return Math.round(minX + (progress * (maxX - minX)));
		});
	}

	private getAvailableClientSpawnX() {

		const occupiedX = this.activeClients
			.filter((client) => client.active)
			.map((client) => client.x);
		const availableSlots = this.getClientSpawnSlots().filter((slotX) => {
			return occupiedX.every((x) => Math.abs(x - slotX) >= Level.CLIENT_MIN_SPACING);
		});

		if (availableSlots.length === 0) {
			return null;
		}

		return Phaser.Utils.Array.GetRandom(availableSlots);
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

	private setupTrayInputs() {
		if (this.charola1) {
			this.charola1.setInteractive({ useHandCursor: true });
			this.charola1.on(Phaser.Input.Events.POINTER_DOWN, () => {
				this.resolveTrayPlacement("charola1");
			});
		}

		if (this.charola2) {
			this.charola2.setInteractive({ useHandCursor: true });
			this.charola2.on(Phaser.Input.Events.POINTER_DOWN, () => {
				this.resolveTrayPlacement("charola2");
			});
		}
	}

	public claimAvailableTraySlot(trayId: "charola1" | "charola2") {
		const arr = trayId === "charola1" ? this.charola1Products : this.charola2Products;
		const tray = trayId === "charola1" ? this.charola1 : this.charola2;

		if (!tray) {
			return null;
		}

		if (arr.length >= Level.TRAY_CAPACITY) {
			return null;
		}

		const finalCount = arr.length + 1;
		let offsets: number[] = [];

		if (finalCount === 1) {
			offsets = [0];
		} else if (finalCount === 2) {
			offsets = [-Level.TRAY_SLOT_OFFSET / 2, Level.TRAY_SLOT_OFFSET / 2];
		} else {
			offsets = [-Level.TRAY_SLOT_OFFSET, 0, Level.TRAY_SLOT_OFFSET];
		}

		const index = arr.length;
		const x = tray.x + (offsets[index] ?? 0);
		const y = tray.y + 8;
		return { x, y };
	}

	private resolveTrayPlacement(trayId: "charola1" | "charola2") {
		const slot = this.claimAvailableTraySlot(trayId);
		if (!slot) {
			this.sound.play("deny");
			return;
		}

		// If the player has a selected delivery product, place it
		if (this.selectedDeliveryProduct && this.selectedDeliveryProduct instanceof AProduct) {
			(this.selectedDeliveryProduct as AProduct).placeInTray(trayId, slot.x, slot.y);
			return;
		}

		// Otherwise, auto-assign first eligible workplace product
		const candidates = this.children.list
			.filter((child): child is AProduct => child instanceof AProduct)
			.filter((p) => p.canAutoPlaceInTray());

		if (candidates.length === 0) {
			this.sound.play("looseMoney");
			return;
		}

		candidates[0].autoPlaceInTray(trayId, slot.x, slot.y);
	}

	create() {

		this.flushLoadedContent();
		this.editorCreate();
		this.panelRestY = this.panel.y;
		this.applyLevelPlanToIntroPanel();
		this.initializeCoinCounter();
		this.initializeDayIndicator();
		this.initializeClientsLeftIndicator();
		this.setupDipInputs();
		this.setupTrayInputs();
		this.setupIntroOverlay();
		this.setupMenuButton();
		this.playSceneIntro();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
