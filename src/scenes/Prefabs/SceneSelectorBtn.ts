
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
/* END-USER-IMPORTS */

export default class SceneSelectorBtn extends Phaser.GameObjects.Container {

	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? 0, y ?? 0);

		// onBtn
		const onBtn = scene.add.image(0, 0, "onBtn");
		this.add(onBtn);

		// FinalText
		const finalText = scene.add.text(-2, -5, "", {});
		finalText.setOrigin(0.5, 0.5);
		finalText.setStyle({ "color": "#F8ECDA", "fontFamily": "Klop", "fontSize": "36px" });
		this.add(finalText);

		this.finalText = finalText;
		// awake handler
		this.scene.events.once("scene-awake", () => this.awake());

		/* START-USER-CTR-CODE */
		this.buttonImage = onBtn;
		this.baseScaleX = this.scaleX;
		this.baseScaleY = this.scaleY;
		/* END-USER-CTR-CODE */
	}

	public finalText: Phaser.GameObjects.Text;
	public btnText: string = "Levels";
	public initialState: boolean = true;

	/* START-USER-CODE */
	private static readonly ACTIVE_TEXT_COLOR = "#F8ECDA";
	private static readonly INACTIVE_TEXT_COLOR = "#A96625";
	private static readonly HOVER_SCALE = 1.06;
	private static readonly HOVER_DURATION = 220;
	private buttonImage!: Phaser.GameObjects.Image;
	private readonly baseScaleX: number;
	private readonly baseScaleY: number;
	private isActive = true;
	private isHovering = false;
	private hoverTween?: Phaser.Tweens.Tween;

	private awake() {
		this.isActive = this.initialState;
		this.applyBtnText();
		this.applyVisualState();
		this.setupInteractivity();
	}

	public setTabActive(active: boolean) {
		this.isActive = active;
		this.applyVisualState();
	}

	public isTabActive() {
		return this.isActive;
	}

	private applyBtnText() {
		if (!this.finalText) {
			return;
		}

		this.finalText.setText(this.btnText);
	}

	private applyVisualState() {
		if (!this.buttonImage || !this.finalText) {
			return;
		}

		if (this.isActive) {
			this.buttonImage.setTexture("onBtn");
			this.finalText.setColor(SceneSelectorBtn.ACTIVE_TEXT_COLOR);
		} else {
			this.buttonImage.setTexture("offBtn");
			this.finalText.setColor(SceneSelectorBtn.INACTIVE_TEXT_COLOR);
		}
	}

	private setupInteractivity() {
		this.buttonImage.setInteractive({ useHandCursor: true });
		this.buttonImage.removeAllListeners();
		this.buttonImage.on(Phaser.Input.Events.POINTER_OVER, this.handlePointerOver, this);
		this.buttonImage.on(Phaser.Input.Events.POINTER_OUT, this.handlePointerOut, this);
		this.buttonImage.on(Phaser.Input.Events.POINTER_DOWN, () => {
			this.scene.sound.play("pop3");
			this.emit("selected");
		});
	}

	private handlePointerOver() {
		this.isHovering = true;
		this.animateScale(
			this.baseScaleX * SceneSelectorBtn.HOVER_SCALE,
			this.baseScaleY * SceneSelectorBtn.HOVER_SCALE
		);
	}

	private handlePointerOut() {
		this.isHovering = false;
		this.animateScale(this.baseScaleX, this.baseScaleY);
	}

	private animateScale(scaleX: number, scaleY: number) {
		this.hoverTween?.stop();
		this.hoverTween = this.scene.tweens.add({
			targets: this,
			scaleX,
			scaleY,
			duration: SceneSelectorBtn.HOVER_DURATION,
			ease: "Back.Out"
		});
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
