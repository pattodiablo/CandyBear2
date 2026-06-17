
// You can write more code here

/* START OF COMPILED CODE */

import SceneSelectorBtn from "./Prefabs/SceneSelectorBtn";
/* START-USER-IMPORTS */
import CardPrefab from "./Prefabs/CardPrefab";
import dayHolderPrefab from "./Prefabs/dayHolderPrefab";
import { getHighestUnlockedLevel, getLevelStars } from "./levelProgress";
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

		// momentsBtnPrefab (prefab fields)
		momentsBtnPrefab.btnText = "Moments";
		momentsBtnPrefab.initialState = false;

		this.nextPage = nextPage;
		this.prevPage = prevPage;
		this.pageNumber = pageNumber;
		this.levelsBtnPrefab = levelsBtnPrefab;
		this.momentsBtnPrefab = momentsBtnPrefab;

		this.events.emit("scene-awake");
	}

	private nextPage!: Phaser.GameObjects.Image;
	private prevPage!: Phaser.GameObjects.Image;
	private pageNumber!: Phaser.GameObjects.Text;
	private levelsBtnPrefab!: SceneSelectorBtn;
	private momentsBtnPrefab!: SceneSelectorBtn;

	/* START-USER-CODE */
	private static readonly TOTAL_DAY_HOLDERS = 40;
	private static readonly TOTAL_MOMENT_CARDS = 40;
	private static readonly LEVELS_ITEMS_PER_PAGE = 10;
	private static readonly MOMENTS_ITEMS_PER_PAGE = 5;
	private static readonly ITEMS_PER_ROW = 5;
	private static readonly SCENE_CENTER_X = 640;
	private static readonly GRID_COLUMN_GAP = 215;
	private static readonly GRID_ROW_GAP = 205;
	private static readonly GRID_START_Y = 270;
	private static readonly DEFAULT_REVERSO_TEXTURE_KEY = "ReversoCard1";
	private dayHolders: dayHolderPrefab[] = [];
	private momentCards: CardPrefab[] = [];
	private activeTab: "levels" | "moments" = "levels";
	private levelsPageIndex = 0;
	private momentsPageIndex = 0;
	private highestUnlockedLevel = 1;

	init() {

		this.activeTab = "levels";
		this.levelsPageIndex = 0;
		this.momentsPageIndex = 0;
	}

	create() {

		this.flushLoadedContent();
		this.editorCreate();
		this.highestUnlockedLevel = getHighestUnlockedLevel(SceneSelector.TOTAL_DAY_HOLDERS);
		this.createDayHolders();
		this.createMomentCards();
		this.initializeTabButtons();
		this.initializePagination();
		this.refreshPage();
	}

	private flushLoadedContent() {

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
		for (let index = 0; index < SceneSelector.TOTAL_MOMENT_CARDS; index++) {
			const { x, y } = this.getGridPosition(index, SceneSelector.MOMENTS_ITEMS_PER_PAGE, false);
			const momentCard = new CardPrefab(this, x, y);

			momentCard.Reverso = { key: SceneSelector.DEFAULT_REVERSO_TEXTURE_KEY };
			momentCard.initializeCard();
			momentCard.setVisible(false);
			this.add.existing(momentCard);
			this.momentCards.push(momentCard);
		}
	}

	private initializeTabButtons() {
		this.levelsBtnPrefab.on("selected", () => {
			this.switchTab("levels");
		});
		this.momentsBtnPrefab.on("selected", () => {
			this.switchTab("moments");
		});
	}

	private switchTab(tab: "levels" | "moments") {
		if (this.activeTab === tab) {
			return;
		}

		this.activeTab = tab;
		this.levelsBtnPrefab.setTabActive(tab === "levels");
		this.momentsBtnPrefab.setTabActive(tab === "moments");
		this.clampCurrentPageIndex();
		this.refreshPage();
	}

	private startLevel(levelNumber: number) {
		this.scene.start("Level", { levelNumber });
	}

	private initializePagination() {
		this.nextPage.setInteractive({ useHandCursor: true });
		this.prevPage.setInteractive({ useHandCursor: true });
		this.nextPage.on(Phaser.Input.Events.POINTER_DOWN, this.goToNextPage, this);
		this.prevPage.on(Phaser.Input.Events.POINTER_DOWN, this.goToPreviousPage, this);
	}

	private goToNextPage() {
		if (this.getCurrentPageIndex() >= this.getLastPageIndex()) {
			return;
		}

		this.setCurrentPageIndex(this.getCurrentPageIndex() + 1);
		this.refreshPage();
	}

	private goToPreviousPage() {
		if (this.getCurrentPageIndex() <= 0) {
			return;
		}

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
		const x = this.getGridStartX() + (column * SceneSelector.GRID_COLUMN_GAP);
		const y = useTwoRows
			? SceneSelector.GRID_START_Y + (row * SceneSelector.GRID_ROW_GAP)
			: SceneSelector.GRID_START_Y + (SceneSelector.GRID_ROW_GAP * 0.5);

		return { x, y };
	}

	private getGridStartX() {
		const gridWidth = (SceneSelector.ITEMS_PER_ROW - 1) * SceneSelector.GRID_COLUMN_GAP;
		return SceneSelector.SCENE_CENTER_X - (gridWidth / 2);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
