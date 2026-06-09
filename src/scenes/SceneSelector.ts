
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
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
		const nextPage = this.add.image(1196, 628, "NextPage");

		// prevPage
		const prevPage = this.add.image(83, 628, "PrevPage");

		// PageNumber
		const pageNumber = this.add.text(640, 82, "", {});
		pageNumber.setOrigin(0.5, 0.5);
		pageNumber.text = "1/4";
		pageNumber.setStyle({ "color": "#A96625", "fontFamily": "Klop", "fontSize": "40px" });

		this.nextPage = nextPage;
		this.prevPage = prevPage;
		this.pageNumber = pageNumber;

		this.events.emit("scene-awake");
	}

	private nextPage!: Phaser.GameObjects.Image;
	private prevPage!: Phaser.GameObjects.Image;
	private pageNumber!: Phaser.GameObjects.Text;

	/* START-USER-CODE */
	private static readonly TOTAL_DAY_HOLDERS = 40;
	private static readonly ITEMS_PER_PAGE = 10;
	private static readonly ITEMS_PER_ROW = 5;
	private static readonly GRID_START_X = 182;
	private static readonly GRID_START_Y = 219;
	private static readonly GRID_COLUMN_GAP = 229;
	private static readonly GRID_ROW_GAP = 220;
	private dayHolders: dayHolderPrefab[] = [];
	private currentPageIndex = 0;
	private highestUnlockedLevel = 1;

	init() {

		this.currentPageIndex = 0;
	}

	create() {

		this.flushLoadedContent();
		this.editorCreate();
		this.highestUnlockedLevel = getHighestUnlockedLevel(SceneSelector.TOTAL_DAY_HOLDERS);
		this.createDayHolders();
		this.initializePagination();
		this.refreshPage();
	}

	private flushLoadedContent() {

		this.dayHolders.length = 0;
		this.children.removeAll(true);
		this.tweens.killAll();
		this.time.removeAllEvents();
	}

	private createDayHolders() {
		for (let index = 0; index < SceneSelector.TOTAL_DAY_HOLDERS; index++) {
			const pageSlot = index % SceneSelector.ITEMS_PER_PAGE;
			const column = pageSlot % SceneSelector.ITEMS_PER_ROW;
			const row = Math.floor(pageSlot / SceneSelector.ITEMS_PER_ROW);
			const x = SceneSelector.GRID_START_X + (column * SceneSelector.GRID_COLUMN_GAP);
			const y = SceneSelector.GRID_START_Y + (row * SceneSelector.GRID_ROW_GAP);
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
		if (this.currentPageIndex >= this.getLastPageIndex()) {
			return;
		}

		this.currentPageIndex++;
		this.refreshPage();
	}

	private goToPreviousPage() {
		if (this.currentPageIndex <= 0) {
			return;
		}

		this.currentPageIndex--;
		this.refreshPage();
	}

	private refreshPage() {
		const startIndex = this.currentPageIndex * SceneSelector.ITEMS_PER_PAGE;
		const endIndex = startIndex + SceneSelector.ITEMS_PER_PAGE;

		for (let index = 0; index < this.dayHolders.length; index++) {
			const isVisible = index >= startIndex && index < endIndex;
			this.dayHolders[index].setVisible(isVisible);
		}

		this.pageNumber.setText(`${this.currentPageIndex + 1}/${this.getLastPageIndex() + 1}`);
		this.prevPage.setAlpha(this.currentPageIndex === 0 ? 0.45 : 1);
		this.nextPage.setAlpha(this.currentPageIndex === this.getLastPageIndex() ? 0.45 : 1);
	}

	private getLastPageIndex() {
		return Math.ceil(this.dayHolders.length / SceneSelector.ITEMS_PER_PAGE) - 1;
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
