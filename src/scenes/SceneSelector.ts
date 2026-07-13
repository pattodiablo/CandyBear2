
// You can write more code here

/* START OF COMPILED CODE */

import SceneSelectorBtn from "./Prefabs/SceneSelectorBtn";
/* START-USER-IMPORTS */
import Phaser from "phaser";
import CardPrefab from "./Prefabs/CardPrefab";
import dayHolderPrefab from "./Prefabs/dayHolderPrefab";
import {
	canAffordAnyMomentCard,
	getMomentCardCatalogEntry,
	isMomentCardPrerequisiteMet,
	MOMENT_CARDS_PER_PAGE,
	TOTAL_MOMENT_CARDS,
} from "./momentCardCatalog";
import { getTotalLikes, spendTotalLikes } from "./likeProgress";
import {
	getHighestUnlockedLevel,
	getLevelStars,
	getStoredTotalCoins,
	isInfiniteModeUnlocked,
	spendTotalCoins,
} from "./levelProgress";
import { isMomentCardBought } from "./momentProgress";
import { applySoftRainbowCameraFilter } from "../filters/softRainbowCameraFilter";
/* END-USER-IMPORTS */

export default class SceneSelector extends Phaser.Scene {

	constructor() {
		super("SceneSelector");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// nextPage
		const nextPage = this.add.image(1221, 376, "NextPage");

		// prevPage
		const prevPage = this.add.image(55, 376, "PrevPage");

		// PageNumber
		const pageNumber = this.add.text(640, 660, "", {});
		pageNumber.setOrigin(0.5, 0.5);
		pageNumber.text = "1/4";
		pageNumber.setStyle({ "color": "#A96625", "fontFamily": "Klop", "fontSize": "36px" });

		// LevelsBtnPrefab
		const levelsBtnPrefab = new SceneSelectorBtn(this, 460, 91);
		this.add.existing(levelsBtnPrefab);

		// MomentsBtnPrefab
		const momentsBtnPrefab = new SceneSelectorBtn(this, 809, 91);
		this.add.existing(momentsBtnPrefab);

		// bigCoin
		const bigCoin = this.add.image(1231, 49, "bigCoin");

		// likeHeart
		const likeHeart = this.add.image(1235, 118, "likeHeart");

		// InfiniteModeBtn
		const infiniteModeBtn = new SceneSelectorBtn(this, 303, 648);
		this.add.existing(infiniteModeBtn);

		// PlayBtn
		const playBtn = new SceneSelectorBtn(this, 988, 648);
		this.add.existing(playBtn);

		// momentsBtnPrefab (prefab fields)
		momentsBtnPrefab.btnText = "Upgrades";
		momentsBtnPrefab.initialState = false;

		// infiniteModeBtn (prefab fields)
		infiniteModeBtn.btnText = "Infinite Mode";
		infiniteModeBtn.initialState = false;

		// playBtn (prefab fields)
		playBtn.btnText = "Play";
		playBtn.initialState = false;

		this.nextPage = nextPage;
		this.prevPage = prevPage;
		this.pageNumber = pageNumber;
		this.levelsBtnPrefab = levelsBtnPrefab;
		this.momentsBtnPrefab = momentsBtnPrefab;
		this.bigCoin = bigCoin;
		this.likeHeart = likeHeart;
		this.infiniteModeBtn = infiniteModeBtn;
		this.playBtn = playBtn;

		this.events.emit("scene-awake");
	}

	private nextPage!: Phaser.GameObjects.Image;
	private prevPage!: Phaser.GameObjects.Image;
	private pageNumber!: Phaser.GameObjects.Text;
	private levelsBtnPrefab!: SceneSelectorBtn;
	private momentsBtnPrefab!: SceneSelectorBtn;
	private bigCoin!: Phaser.GameObjects.Image;
	private likeHeart!: Phaser.GameObjects.Image;
	private infiniteModeBtn!: SceneSelectorBtn;
	private playBtn!: SceneSelectorBtn;

	/* START-USER-CODE */
	private static readonly TOTAL_DAY_HOLDERS = 40;
	private static readonly LEVELS_ITEMS_PER_PAGE = 10;
	private static readonly MOMENTS_ITEMS_PER_PAGE = MOMENT_CARDS_PER_PAGE;
	private static readonly ITEMS_PER_ROW = 5;
	private static readonly SCENE_CENTER_X = 640;
	private static readonly GRID_COLUMN_GAP = 215;
	/** Más gap para cartas de upgrade más grandes; flechas más chicas liberan espacio. */
	private static readonly MOMENTS_GRID_COLUMN_GAP = 220;
	private static readonly GRID_ROW_GAP = 205;
	private static readonly GRID_START_Y = 270;
	private static readonly PAGE_ARROW_SCALE = 0.72;
	private static readonly PAGE_ARROW_LEFT_X = 48;
	private static readonly PAGE_ARROW_RIGHT_X = 1232;

	/**
	 * Preview más moderado y un poco más arriba para que el texto
	 * de la carta no se salga por abajo en mobile.
	 */
	private static readonly CARD_PREVIEW_SCALE = 1.12;
	private static readonly CARD_PREVIEW_CENTER_X = 640;
	private static readonly CARD_PREVIEW_CENTER_Y = 255;
	private static readonly CARD_PREVIEW_DURATION = 280;
	private static readonly CARD_PREVIEW_OVERLAY_ALPHA = 0.65;
	private static readonly CARD_PREVIEW_DEPTH = 1000;
	private static readonly HUD_DEPTH = 1100;
	private static readonly HUD_COUNTER_GAP = 10;
	private static readonly HUD_HIGHLIGHT_COLOR = "#D62839";
	private static readonly HUD_DEFAULT_COLOR = "#2D120B";
	private static readonly CAMERA_SHAKE_DURATION = 220;
	private static readonly CAMERA_SHAKE_INTENSITY = 0.008;
	private dayHolders: dayHolderPrefab[] = [];
	private momentCards: CardPrefab[] = [];
	private activeTab: "levels" | "moments" = "levels";
	private levelsPageIndex = 0;
	private momentsPageIndex = 0;
	private highestUnlockedLevel = 1;
	private cardPreviewOverlay?: Phaser.GameObjects.Image;
	private focusedCard?: CardPrefab;
	private focusedCardRestState?: {
		x: number;
		y: number;
		scaleX: number;
		scaleY: number;
		angle: number;
		depth: number;
	};
	private cardPreviewTween?: Phaser.Tweens.Tween;
	private cardPreviewOverlayTween?: Phaser.Tweens.Tween;
	private coinCounterText?: Phaser.GameObjects.Text;
	private likesCounterText?: Phaser.GameObjects.Text;
	private hudHighlightTween?: Phaser.Tweens.Tween;
	private backgroundMusic?: Phaser.Sound.BaseSound;

	init(data: { openTab?: "levels" | "moments" } = {}) {

		this.activeTab = data.openTab === "moments" ? "moments" : "levels";
		this.levelsPageIndex = 0;
		this.momentsPageIndex = 0;
	}

	create() {

		this.flushLoadedContent();
		this.editorCreate();
		this.initializePlayerStats();
		this.highestUnlockedLevel = getHighestUnlockedLevel(SceneSelector.TOTAL_DAY_HOLDERS);
		this.createDayHolders();
		this.createMomentCards();
		this.initializeCardPreview();
		this.initializeTabButtons();
		// Respeta openTab (p. ej. "moments" desde el CTA Buy upgrades del fin de nivel).
		this.levelsBtnPrefab.setTabActive(this.activeTab === "levels");
		this.momentsBtnPrefab.setTabActive(this.activeTab === "moments");
		this.initializePagination();
		this.refreshPage();
		this.updateMomentsButtonAttention();
		applySoftRainbowCameraFilter(this, { strength: 0.5, speed: 0.3});
		this.startBackgroundMusic();
	}

	private flushLoadedContent() {

		if (this.backgroundMusic) {
			this.backgroundMusic.stop();
			this.backgroundMusic.destroy();
			this.backgroundMusic = undefined;
		}

		this.focusedCard = undefined;
		this.focusedCardRestState = undefined;
		this.cardPreviewOverlay = undefined;
		this.cardPreviewTween = undefined;
		this.cardPreviewOverlayTween = undefined;
		this.dayHolders.length = 0;
		this.momentCards.length = 0;
		this.children.removeAll(true);
		this.tweens.killAll();
		this.time.removeAllEvents();
	}

	private createDayHolders() {
		for (let index = 0; index < SceneSelector.TOTAL_DAY_HOLDERS; index++) {
			const { x, y } = this.getGridPosition(index, SceneSelector.LEVELS_ITEMS_PER_PAGE, true);
			const dayHolder = new dayHolderPrefab(this, x, y);
			const levelNumber = index + 1;

			dayHolder.setDayNumber(levelNumber);
			dayHolder.setEarnedStars(getLevelStars(levelNumber));
			dayHolder.setUnlocked(levelNumber <= this.highestUnlockedLevel);
			dayHolder.setVisible(false);
			dayHolder.on("selected", () => {
				this.startLevel(levelNumber);
			});
			this.add.existing(dayHolder);
			this.dayHolders.push(dayHolder);
		}
	}

	private createMomentCards() {
		for (let index = 0; index < TOTAL_MOMENT_CARDS; index++) {
			const { x, y } = this.getGridPosition(index, SceneSelector.MOMENTS_ITEMS_PER_PAGE, false);
			const momentCard = new CardPrefab(this, x, y);
			const cardNumber = index + 1;

			const cardEntry = getMomentCardCatalogEntry(cardNumber);

			momentCard.cardNumber = cardNumber;
			momentCard.Reverso = { key: cardEntry.reversoTextureKey };
			momentCard.buyed = isMomentCardBought(cardNumber);
			momentCard.setCosts(cardEntry.coinCost, cardEntry.likeCost);
			momentCard.setUpgradeDescription(cardEntry.upgradeName, cardEntry.upgrade.effect);
			momentCard.initializeCard();
			momentCard.setVisible(false);
			momentCard.on("purchase-request", () => {
				this.tryPurchaseCard(momentCard);
			});
			momentCard.on("purchase-blocked", () => {
				this.handlePrerequisiteBlockedPurchase(momentCard);
			});
			momentCard.on("purchased", () => {
				this.refreshMomentCardPrerequisiteLocks();
				this.updatePlayerStats();
			});
			momentCard.on("preview-open", () => {
				this.openCardPreview(momentCard);
			});
			this.add.existing(momentCard);
			this.momentCards.push(momentCard);
		}

		this.refreshMomentCardPrerequisiteLocks();
	}

	private refreshMomentCardPrerequisiteLocks() {
		for (const momentCard of this.momentCards) {
			if (momentCard.buyed) {
				momentCard.setPrerequisiteLocked(false);
				continue;
			}

			momentCard.setPrerequisiteLocked(!isMomentCardPrerequisiteMet(momentCard.cardNumber));
		}
	}

	private handlePrerequisiteBlockedPurchase(card: CardPrefab) {
		void card;
		this.cameras.main.shake(SceneSelector.CAMERA_SHAKE_DURATION, SceneSelector.CAMERA_SHAKE_INTENSITY);

		if (this.cache.audio.exists("deny")) {
			this.sound.play("deny");
		}
	}

	private initializePlayerStats() {
		this.coinCounterText = this.add.text(0, this.bigCoin.y, "0", this.getHudTextStyle("#2D120B"));
		this.coinCounterText.setOrigin(1, 0.5);
		this.coinCounterText.setDepth(SceneSelector.HUD_DEPTH);
		this.layoutCounterLeftOfIcon(this.coinCounterText, this.bigCoin);

		this.likesCounterText = this.add.text(0, this.likeHeart.y, "0", this.getHudTextStyle("#2D120B"));
		this.likesCounterText.setOrigin(1, 0.5);
		this.likesCounterText.setDepth(SceneSelector.HUD_DEPTH);
		this.layoutCounterLeftOfIcon(this.likesCounterText, this.likeHeart);

		this.bigCoin.setDepth(SceneSelector.HUD_DEPTH);
		this.likeHeart.setDepth(SceneSelector.HUD_DEPTH);
		this.updatePlayerStats();
	}

	private getHudTextStyle(color: string) {
		return {
			color,
			fontFamily: "Klop",
			fontSize: "40px",
			fontStyle: "bold",
			stroke: "#fff8f3",
			strokeThickness: 6
		};
	}

	private layoutCounterLeftOfIcon(counterText: Phaser.GameObjects.Text, icon: Phaser.GameObjects.Image) {
		counterText.x = icon.x - (icon.displayWidth * 0.5) - SceneSelector.HUD_COUNTER_GAP;
		counterText.y = icon.y;
	}

	private updatePlayerStats() {
		this.coinCounterText?.setText(String(getStoredTotalCoins()));
		this.likesCounterText?.setText(String(getTotalLikes()));
		this.updateMomentsButtonAttention();
	}

	private updateMomentsButtonAttention() {
		const shouldBlink = this.activeTab === "levels" && canAffordAnyMomentCard();
		this.momentsBtnPrefab.setAttentionActive(shouldBlink);
	}

	private tryPurchaseCard(card: CardPrefab) {
		if (card.buyed) {
			return;
		}

		if (!isMomentCardPrerequisiteMet(card.cardNumber)) {
			this.handlePrerequisiteBlockedPurchase(card);
			return;
		}

		const cardEntry = getMomentCardCatalogEntry(card.cardNumber);
		const hasEnoughCoins = getStoredTotalCoins() >= cardEntry.coinCost;
		const hasEnoughLikes = getTotalLikes() >= cardEntry.likeCost;

		if (!hasEnoughCoins || !hasEnoughLikes) {
			this.cameras.main.shake(SceneSelector.CAMERA_SHAKE_DURATION, SceneSelector.CAMERA_SHAKE_INTENSITY);

			if (!hasEnoughCoins) {
				this.highlightHudResource("coins");
			}

			if (!hasEnoughLikes) {
				this.highlightHudResource("likes");
			}

			return;
		}

		if (!spendTotalCoins(cardEntry.coinCost) || !spendTotalLikes(cardEntry.likeCost)) {
			this.cameras.main.shake(SceneSelector.CAMERA_SHAKE_DURATION, SceneSelector.CAMERA_SHAKE_INTENSITY);
			this.highlightHudResource("coins");
			this.highlightHudResource("likes");
			return;
		}

		this.sound.play("likeSound");
		this.updatePlayerStats();
		card.beginPurchaseFlip();
	}

	private highlightHudResource(resource: "coins" | "likes") {
		const counterText = resource === "coins" ? this.coinCounterText : this.likesCounterText;
		const icon = resource === "coins" ? this.bigCoin : this.likeHeart;
		const targets: Phaser.GameObjects.GameObject[] = [];

		if (icon) {
			targets.push(icon);
		}

		if (counterText) {
			targets.push(counterText);
		}

		if (targets.length === 0) {
			return;
		}

		this.hudHighlightTween?.stop();
		counterText?.setColor(SceneSelector.HUD_HIGHLIGHT_COLOR);

		this.hudHighlightTween = this.tweens.add({
			targets,
			scaleX: "*=1.14",
			scaleY: "*=1.14",
			duration: 110,
			yoyo: true,
			repeat: 2,
			onComplete: () => {
				counterText?.setColor(SceneSelector.HUD_DEFAULT_COLOR);
				icon?.setScale(1);
			}
		});
	}

	private initializeCardPreview() {
		this.cardPreviewOverlay = this.add.image(0, 0, "blurOverlay");
		this.cardPreviewOverlay.setOrigin(0, 0);
		this.cardPreviewOverlay.setScale(7, 4);
		this.cardPreviewOverlay.setAlpha(0);
		this.cardPreviewOverlay.setVisible(false);
		this.cardPreviewOverlay.setDepth(SceneSelector.CARD_PREVIEW_DEPTH - 1);
		this.cardPreviewOverlay.setInteractive(
			new Phaser.Geom.Rectangle(0, 0, this.scale.width, this.scale.height),
			Phaser.Geom.Rectangle.Contains
		);
		this.cardPreviewOverlay.on(Phaser.Input.Events.POINTER_DOWN, () => {
			this.closeCardPreview();
		});
	}

	private openCardPreview(card: CardPrefab) {
		if (!card.buyed || this.focusedCard === card) {
			return;
		}

		if (this.focusedCard) {
			this.closeCardPreview(false);
		}

		card.pauseFloatAnimation();

		const swooshSoundKey = Phaser.Math.Between(0, 1) === 0 ? "swoosh" : "swoosh2";
		this.sound.play(swooshSoundKey);

		this.focusedCard = card;
		this.focusedCardRestState = {
			x: card.x,
			y: card.y,
			scaleX: card.scaleX,
			scaleY: card.scaleY,
			angle: card.angle,
			depth: card.depth
		};

		this.cardPreviewOverlay?.setVisible(true);
		this.cardPreviewOverlay?.setAlpha(0);
		this.cardPreviewOverlayTween?.stop();
		this.cardPreviewOverlayTween = this.tweens.add({
			targets: this.cardPreviewOverlay,
			alpha: SceneSelector.CARD_PREVIEW_OVERLAY_ALPHA,
			duration: SceneSelector.CARD_PREVIEW_DURATION,
			ease: "Quad.Out"
		});

		card.setDepth(SceneSelector.CARD_PREVIEW_DEPTH);
		this.cardPreviewTween?.stop();
		this.cardPreviewTween = this.tweens.add({
			targets: card,
			x: SceneSelector.CARD_PREVIEW_CENTER_X,
			y: SceneSelector.CARD_PREVIEW_CENTER_Y,
			scaleX: SceneSelector.CARD_PREVIEW_SCALE,
			scaleY: SceneSelector.CARD_PREVIEW_SCALE,
			duration: SceneSelector.CARD_PREVIEW_DURATION,
			ease: "Back.Out"
		});
	}

	private closeCardPreview(animated = true) {
		if (!this.focusedCard || !this.focusedCardRestState) {
			return;
		}

		const card = this.focusedCard;
		const restState = this.focusedCardRestState;

		this.cardPreviewTween?.stop();
		this.cardPreviewOverlayTween?.stop();

		const finishClose = () => {
			this.cardPreviewOverlay?.setVisible(false);
			this.cardPreviewOverlay?.setAlpha(0);
			this.focusedCard = undefined;
			this.focusedCardRestState = undefined;
		};

		const resumeCardFloat = () => {
			card.setAngle(restState.angle);
			card.syncFloatBasePosition();
			card.resumeFloatAnimation();
		};

		if (!animated) {
			card.setPosition(restState.x, restState.y);
			card.setScale(restState.scaleX, restState.scaleY);
			card.setAngle(restState.angle);
			card.setDepth(restState.depth);
			resumeCardFloat();
			finishClose();
			return;
		}

		this.tweens.add({
			targets: card,
			x: restState.x,
			y: restState.y,
			scaleX: restState.scaleX,
			scaleY: restState.scaleY,
			angle: restState.angle,
			duration: SceneSelector.CARD_PREVIEW_DURATION,
			ease: "Back.In",
			onComplete: () => {
				card.setDepth(restState.depth);
				resumeCardFloat();
			}
		});

		this.tweens.add({
			targets: this.cardPreviewOverlay,
			alpha: 0,
			duration: SceneSelector.CARD_PREVIEW_DURATION,
			ease: "Quad.In",
			onComplete: finishClose
		});
	}

	private initializeTabButtons() {
		this.levelsBtnPrefab.on("selected", () => {
			this.switchTab("levels");
		});
		this.momentsBtnPrefab.on("selected", () => {
			this.switchTab("moments");
		});
		this.infiniteModeBtn.on("selected", () => {
			this.startInfiniteMode();
		});
		this.playBtn.on("selected", () => {
			this.startPlayFromProgress();
		});
		// Visible solo si ya se desbloqueó (p. ej. desde CredictsScene).
		this.setInfiniteModeAvailable(isInfiniteModeUnlocked());
		// Play como CTA principal (estado "on").
		this.playBtn.setTabActive(true);
	}

	/** Muestra u oculta el botón de Infinite Mode según progreso desbloqueado. */
	public setInfiniteModeAvailable(available: boolean) {
		this.infiniteModeBtn.setVisible(available);
		this.infiniteModeBtn.setActive(available);
	}

	private switchTab(tab: "levels" | "moments") {
		if (this.activeTab === tab) {
			return;
		}

		this.closeCardPreview(false);
		this.activeTab = tab;
		this.levelsBtnPrefab.setTabActive(tab === "levels");
		this.momentsBtnPrefab.setTabActive(tab === "moments");
		this.clampCurrentPageIndex();
		this.refreshPage();
		this.updateMomentsButtonAttention();
	}

	private startLevel(levelNumber: number) {
		this.backgroundMusic?.stop();
		this.scene.start("Level", { levelNumber });
	}

	/** Continúa en el nivel más alto desbloqueado. */
	private startPlayFromProgress() {
		this.startLevel(this.highestUnlockedLevel);
	}

	private startInfiniteMode() {
		this.backgroundMusic?.stop();
		this.scene.start("Level", { infiniteMode: true });
	}

	private startBackgroundMusic() {

		if (this.backgroundMusic?.isPlaying) {
			return;
		}

		this.backgroundMusic = this.sound.add("ScenSelectionBgmusic", { loop: true, volume: 0.5 });
		this.backgroundMusic.play();
	}

	private initializePagination() {
		this.prevPage.setScale(SceneSelector.PAGE_ARROW_SCALE);
		this.nextPage.setScale(SceneSelector.PAGE_ARROW_SCALE);
		this.prevPage.setX(SceneSelector.PAGE_ARROW_LEFT_X);
		this.nextPage.setX(SceneSelector.PAGE_ARROW_RIGHT_X);

		this.nextPage.setInteractive({ useHandCursor: true });
		this.prevPage.setInteractive({ useHandCursor: true });
		this.nextPage.on(Phaser.Input.Events.POINTER_DOWN, this.goToNextPage, this);
		this.prevPage.on(Phaser.Input.Events.POINTER_DOWN, this.goToPreviousPage, this);
	}

	private goToNextPage() {
		if (this.getCurrentPageIndex() >= this.getLastPageIndex()) {
			return;
		}

		this.closeCardPreview(false);
		this.setCurrentPageIndex(this.getCurrentPageIndex() + 1);
		this.refreshPage();
	}

	private goToPreviousPage() {
		if (this.getCurrentPageIndex() <= 0) {
			return;
		}

		this.closeCardPreview(false);
		this.setCurrentPageIndex(this.getCurrentPageIndex() - 1);
		this.refreshPage();
	}

	private refreshPage() {
		const currentPageIndex = this.getCurrentPageIndex();
		const itemsPerPage = this.getItemsPerPage();
		const startIndex = currentPageIndex * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		const showLevels = this.activeTab === "levels";
		const showMoments = this.activeTab === "moments";

		if (this.focusedCard && !this.focusedCard.visible) {
			this.closeCardPreview(false);
		}

		for (let index = 0; index < this.dayHolders.length; index++) {
			const isOnCurrentPage = index >= startIndex && index < endIndex;
			this.dayHolders[index].setVisible(showLevels && isOnCurrentPage);
		}

		for (let index = 0; index < this.momentCards.length; index++) {
			const isOnCurrentPage = index >= startIndex && index < endIndex;
			this.momentCards[index].setVisible(showMoments && isOnCurrentPage);
		}

		this.pageNumber.setText(`${currentPageIndex + 1}/${this.getLastPageIndex() + 1}`);
		this.prevPage.setAlpha(currentPageIndex === 0 ? 0.45 : 1);
		this.nextPage.setAlpha(currentPageIndex === this.getLastPageIndex() ? 0.45 : 1);
	}

	private getCurrentPageIndex() {
		return this.activeTab === "levels" ? this.levelsPageIndex : this.momentsPageIndex;
	}

	private setCurrentPageIndex(pageIndex: number) {
		if (this.activeTab === "levels") {
			this.levelsPageIndex = pageIndex;
			return;
		}

		this.momentsPageIndex = pageIndex;
	}

	private getActiveItemCount() {
		return this.activeTab === "levels"
			? this.dayHolders.length
			: this.momentCards.length;
	}

	private getItemsPerPage() {
		return this.activeTab === "levels"
			? SceneSelector.LEVELS_ITEMS_PER_PAGE
			: SceneSelector.MOMENTS_ITEMS_PER_PAGE;
	}

	private getLastPageIndex() {
		return Math.ceil(this.getActiveItemCount() / this.getItemsPerPage()) - 1;
	}

	private clampCurrentPageIndex() {
		const lastPageIndex = this.getLastPageIndex();

		if (this.getCurrentPageIndex() > lastPageIndex) {
			this.setCurrentPageIndex(lastPageIndex);
		}
	}

	private getGridPosition(index: number, itemsPerPage: number, useTwoRows: boolean) {
		const pageSlot = index % itemsPerPage;
		const column = pageSlot % SceneSelector.ITEMS_PER_ROW;
		const row = useTwoRows ? Math.floor(pageSlot / SceneSelector.ITEMS_PER_ROW) : 0;
		const columnGap = useTwoRows
			? SceneSelector.GRID_COLUMN_GAP
			: SceneSelector.MOMENTS_GRID_COLUMN_GAP;
		const x = this.getGridStartX(columnGap) + (column * columnGap);
		const y = useTwoRows
			? SceneSelector.GRID_START_Y + (row * SceneSelector.GRID_ROW_GAP)
			: SceneSelector.GRID_START_Y + (SceneSelector.GRID_ROW_GAP * 0.5);

		return { x, y };
	}

	private getGridStartX(columnGap = SceneSelector.GRID_COLUMN_GAP) {
		const gridWidth = (SceneSelector.ITEMS_PER_ROW - 1) * columnGap;
		return SceneSelector.SCENE_CENTER_X - (gridWidth / 2);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
