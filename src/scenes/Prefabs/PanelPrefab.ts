
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class PanelPrefab extends Phaser.GameObjects.Container {

	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? -44, y ?? 0);

		// panel
		const panel = scene.add.image(44, 0, "dayOneLabel");
		panel.scaleX = 0.7;
		panel.scaleY = 0.7;
		this.add(panel);

		// readyBtn
		const readyBtn = scene.add.image(46, 27, "readyBtn");
		readyBtn.scaleX = 0.7;
		readyBtn.scaleY = 0.7;
		this.add(readyBtn);

		// nextdayBtn
		const nextdayBtn = scene.add.image(43, 155, "nextdayBtn");
		nextdayBtn.scaleX = 0.7;
		nextdayBtn.scaleY = 0.7;
		this.add(nextdayBtn);

		// starHolder
		const starHolder = scene.add.image(50, -151, "StarHolder");
		starHolder.scaleX = 0.7;
		starHolder.scaleY = 0.7;
		this.add(starHolder);

		// bigStar2
		const bigStar2 = scene.add.image(43, -178, "BigStar");
		bigStar2.scaleX = 0.7;
		bigStar2.scaleY = 0.7;
		this.add(bigStar2);

		// bigStar1
		const bigStar1 = scene.add.image(-62, -162, "BigStar");
		bigStar1.scaleX = 0.7;
		bigStar1.scaleY = 0.7;
		this.add(bigStar1);

		// bigStar3
		const bigStar3 = scene.add.image(149, -162, "BigStar");
		bigStar3.scaleX = 0.7;
		bigStar3.scaleY = 0.7;
		this.add(bigStar3);

		// FinalLabels
		const finalLabels = scene.add.container(0, 0);
		this.add(finalLabels);

		// earnedToday
		const earnedToday = scene.add.text(40, 86, "", {});
		earnedToday.setOrigin(0.5, 0.5);
		earnedToday.text = "Earnings today";
		earnedToday.setStyle({ "color": "#A96625", "fontFamily": "Klop", "fontSize": "30px" });
		finalLabels.add(earnedToday);

		// totalCoins
		const totalCoins = scene.add.text(43, 13, "", {});
		totalCoins.setOrigin(0.5, 0.5);
		totalCoins.text = "0";
		totalCoins.setStyle({ "color": "#FFE769", "fontFamily": "Klop", "fontSize": "100px", "stroke": "#FEB134", "strokeThickness": 15 });
		finalLabels.add(totalCoins);

		this.panel = panel;
		this.readyBtn = readyBtn;
		this.nextdayBtn = nextdayBtn;
		this.bigStar2 = bigStar2;
		this.bigStar1 = bigStar1;
		this.bigStar3 = bigStar3;
		this.earnedToday = earnedToday;
		this.totalCoins = totalCoins;
		this.finalLabels = finalLabels;

		/* START-USER-CTR-CODE */
		finalLabels.add(nextdayBtn);
		finalLabels.add(starHolder);
		finalLabels.add(bigStar2);
		finalLabels.add(bigStar1);
		finalLabels.add(bigStar3);
		finalLabels.setVisible(false);

		this.readyBtnBaseScaleX = readyBtn.scaleX;
		this.readyBtnBaseScaleY = readyBtn.scaleY;
		this.readyBtnBaseY = readyBtn.y;
		this.nextDayButtonBaseScaleX = nextdayBtn.scaleX;
		this.nextDayButtonBaseScaleY = nextdayBtn.scaleY;
		this.nextDayButtonBaseY = nextdayBtn.y;

		this.dayLabelText = scene.add.text(44, -70, "Day 1", {
			color: "#DF3D7A",
			fontFamily: "Klop",
			fontSize: "76px",
			fontStyle: "bold",
			stroke: "#fff8f3",
			strokeThickness: 8,
		});
		this.dayLabelText.setOrigin(0.5);
		this.add(this.dayLabelText);
		/* END-USER-CTR-CODE */
	}

	private panel: Phaser.GameObjects.Image;
	private readyBtn: Phaser.GameObjects.Image;
	private nextdayBtn: Phaser.GameObjects.Image;
	private bigStar2: Phaser.GameObjects.Image;
	private bigStar1: Phaser.GameObjects.Image;
	private bigStar3: Phaser.GameObjects.Image;
	private earnedToday: Phaser.GameObjects.Text;
	private totalCoins: Phaser.GameObjects.Text;
	private finalLabels: Phaser.GameObjects.Container;

	/* START-USER-CODE */
	private static readonly READY_BUTTON_HOVER_SCALE = 0.74;
	private static readonly READY_BUTTON_PRESSED_SCALE = 0.67;
	private static readonly READY_BUTTON_PRESS_OFFSET_Y = 4;
	private static readonly READY_BUTTON_TWEEN_DURATION = 90;
	private dayLabelText!: Phaser.GameObjects.Text;
	private readyBtnBaseScaleX!: number;
	private readyBtnBaseScaleY!: number;
	private readyBtnBaseY!: number;
	private nextDayButtonBaseScaleX!: number;
	private nextDayButtonBaseScaleY!: number;
	private nextDayButtonBaseY!: number;
	private isReadyButtonPressed = false;
	private isNextDayButtonPressed = false;

	public enableReadyButton(onClick: () => void) {
		this.finalLabels.setVisible(false);
		this.readyBtn.setVisible(true);

		this.readyBtn.setInteractive({ useHandCursor: true });
		this.readyBtn.removeAllListeners();
		this.isReadyButtonPressed = false;
		this.animateReadyButton(this.readyBtnBaseScaleX, this.readyBtnBaseScaleY, this.readyBtnBaseY);

		this.readyBtn.on(Phaser.Input.Events.POINTER_OVER, () => {
			if (this.isReadyButtonPressed) {
				return;
			}

			this.animateReadyButton(
				PanelPrefab.READY_BUTTON_HOVER_SCALE,
				PanelPrefab.READY_BUTTON_HOVER_SCALE,
				this.readyBtnBaseY - 2
			);
		});

		this.readyBtn.on(Phaser.Input.Events.POINTER_OUT, () => {
			if (this.isReadyButtonPressed) {
				return;
			}

			this.animateReadyButton(this.readyBtnBaseScaleX, this.readyBtnBaseScaleY, this.readyBtnBaseY);
		});

		this.readyBtn.once(Phaser.Input.Events.POINTER_DOWN, () => {
			this.isReadyButtonPressed = true;
			this.animateReadyButton(
				PanelPrefab.READY_BUTTON_PRESSED_SCALE,
				PanelPrefab.READY_BUTTON_PRESSED_SCALE,
				this.readyBtnBaseY + PanelPrefab.READY_BUTTON_PRESS_OFFSET_Y,
				() => {
			this.readyBtn.disableInteractive();
			onClick();
				}
			);
		});
	}

	public disableReadyButton() {

		this.readyBtn.disableInteractive();
		this.readyBtn.removeAllListeners();
		this.isReadyButtonPressed = false;
		this.animateReadyButton(this.readyBtnBaseScaleX, this.readyBtnBaseScaleY, this.readyBtnBaseY);
	}

	public enableNextDayButton(onClick: () => void) {
		this.nextdayBtn.setVisible(true);
		this.nextdayBtn.setInteractive({ useHandCursor: true });
		this.nextdayBtn.removeAllListeners();
		this.isNextDayButtonPressed = false;
		this.animateNextDayButton(this.nextDayButtonBaseScaleX, this.nextDayButtonBaseScaleY, this.nextDayButtonBaseY);

		this.nextdayBtn.on(Phaser.Input.Events.POINTER_OVER, () => {
			if (this.isNextDayButtonPressed) {
				return;
			}

			this.animateNextDayButton(
				PanelPrefab.READY_BUTTON_HOVER_SCALE,
				PanelPrefab.READY_BUTTON_HOVER_SCALE,
				this.nextDayButtonBaseY - 2
			);
		});

		this.nextdayBtn.on(Phaser.Input.Events.POINTER_OUT, () => {
			if (this.isNextDayButtonPressed) {
				return;
			}

			this.animateNextDayButton(this.nextDayButtonBaseScaleX, this.nextDayButtonBaseScaleY, this.nextDayButtonBaseY);
		});

		this.nextdayBtn.once(Phaser.Input.Events.POINTER_DOWN, () => {
			this.isNextDayButtonPressed = true;
			this.animateNextDayButton(
				PanelPrefab.READY_BUTTON_PRESSED_SCALE,
				PanelPrefab.READY_BUTTON_PRESSED_SCALE,
				this.nextDayButtonBaseY + PanelPrefab.READY_BUTTON_PRESS_OFFSET_Y,
				() => {
					this.nextdayBtn.disableInteractive();
					onClick();
				}
			);
		});
	}

	public disableNextDayButton() {

		this.nextdayBtn.disableInteractive();
		this.nextdayBtn.removeAllListeners();
		this.isNextDayButtonPressed = false;
		this.animateNextDayButton(this.nextDayButtonBaseScaleX, this.nextDayButtonBaseScaleY, this.nextDayButtonBaseY);
	}

	public showFinalState(onNextDayClick?: () => void) {

		this.disableReadyButton();
		this.disableNextDayButton();
		this.readyBtn.setVisible(false);
		this.earnedToday.setVisible(true);
		this.totalCoins.setVisible(true);
		this.finalLabels.setVisible(true);

		if (onNextDayClick) {
			this.enableNextDayButton(onNextDayClick);
		}
	}

	public showIntroState() {

		this.earnedToday.setVisible(false);
		this.totalCoins.setVisible(false);
		this.finalLabels.setVisible(false);
		this.readyBtn.setVisible(true);
		this.disableReadyButton();
		this.disableNextDayButton();
	}

	public setEarnedTodayTotal(total: number) {

		this.totalCoins.setText(`+${Math.max(0, Math.floor(total))}`);
	}

	public setDayLabel(text: string, color = "DF3D7A") {

		this.dayLabelText.setText(text);
		this.dayLabelText.setColor(color.startsWith("#") ? color : `#${color}`);
	}

	private animateReadyButton(scaleX: number, scaleY: number, y: number, onComplete?: () => void) {

		this.scene.tweens.killTweensOf(this.readyBtn);
		this.scene.tweens.add({
			targets: this.readyBtn,
			scaleX,
			scaleY,
			y,
			duration: PanelPrefab.READY_BUTTON_TWEEN_DURATION,
			ease: "Quad.Out",
			onComplete,
		});
	}

	private animateNextDayButton(scaleX: number, scaleY: number, y: number, onComplete?: () => void) {

		this.scene.tweens.killTweensOf(this.nextdayBtn);
		this.scene.tweens.add({
			targets: this.nextdayBtn,
			scaleX,
			scaleY,
			y,
			duration: PanelPrefab.READY_BUTTON_TWEEN_DURATION,
			ease: "Quad.Out",
			onComplete,
		});
	}

	// Write your code here.

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
