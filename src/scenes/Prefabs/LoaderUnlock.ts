
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
/* END-USER-IMPORTS */

export default class LoaderUnlock extends Phaser.GameObjects.Container {

	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? 0, y ?? 0);

		// unlockedBtn
		const unlockedBtn = scene.add.image(0, 0, "unlockedBtn");
		this.add(unlockedBtn);

		// loaderBg
		const loaderBg = scene.add.sprite(0, 0, "loaderBg");
		this.add(loaderBg);

		// LoaderFill
		const loaderFill = scene.add.rectangle(-228, -1, 460, 108);
		loaderFill.scaleX = 0;
		loaderFill.setOrigin(0, 0.5);
		loaderFill.isFilled = true;
		loaderFill.fillColor = 3840611;
		loaderFill.setRounded(20);
		this.add(loaderFill);

		// UnlockedText
		const unlockedText = scene.add.text(0, -77, "", {});
		unlockedText.setOrigin(0.5, 0.5);
		unlockedText.text = "UNLOCKED";
		unlockedText.setStyle({ "color": "#3A9A63", "fontFamily": "Klop", "fontSize": "50px" });
		this.add(unlockedText);

		// unlockStar
		const unlockStar = scene.add.image(237, -1, "unlockStar");
		this.add(unlockStar);

		// ProductPreview
		const productPreview = scene.add.image(237, -1, "Product2Chocolate");
		this.add(productPreview);

		// PrecentajeLoader
		const precentajeLoader = scene.add.text(0, -1, "", {});
		precentajeLoader.setOrigin(0.5, 0.5);
		precentajeLoader.text = "0%";
		precentajeLoader.setStyle({ "color": "#F8ECDA", "fontFamily": "Klop", "fontSize": "50px", "stroke": "#F8ECDA" });
		this.add(precentajeLoader);

		// unlockedThing
		const unlockedThing = scene.add.text(-2, 80, "", {});
		unlockedThing.setOrigin(0.5, 0.5);
		unlockedThing.text = "UNLOCKED";
		unlockedThing.setStyle({ "color": "#3A9A63", "fontFamily": "Klop", "fontSize": "30px" });
		this.add(unlockedThing);

		this.unlockedBtn = unlockedBtn;
		this.loaderBg = loaderBg;
		this.unlockedText = unlockedText;
		this.unlockStar = unlockStar;
		this.productPreview = productPreview;
		this.precentajeLoader = precentajeLoader;
		this.unlockedThing = unlockedThing;

		/* START-USER-CTR-CODE */
		this.loaderFill = loaderFill;
		this.productBaseScaleX = this.productPreview.scaleX;
		this.productBaseScaleY = this.productPreview.scaleY;
		// Deja todo (barra, %, botón, estrella/ícono) en su estado de reposo y oculto.
		this.stopUnlockAnimation();
		/* END-USER-CTR-CODE */
	}

	private unlockedBtn: Phaser.GameObjects.Image;
	public loaderBg: Phaser.GameObjects.Sprite;
	private unlockedText: Phaser.GameObjects.Text;
	private unlockStar: Phaser.GameObjects.Image;
	private productPreview: Phaser.GameObjects.Image;
	private precentajeLoader: Phaser.GameObjects.Text;
	private unlockedThing: Phaser.GameObjects.Text;

	/* START-USER-CODE */

	private static readonly FILL_DURATION_MS = 1200;
	private static readonly STAR_ROTATION_DURATION_MS = 6000;
	private static readonly PRODUCT_PULSE_DURATION_MS = 700;
	private static readonly PRODUCT_PULSE_SCALE = 1.08;
	private static readonly BUTTON_POP_DURATION_MS = 220;
	private static readonly CONTINUE_TEXT = "Continue";

	private loaderFill!: Phaser.GameObjects.Rectangle;
	private productBaseScaleX = 1;
	private productBaseScaleY = 1;
	private fillTween?: Phaser.Tweens.Tween;
	private starTween?: Phaser.Tweens.Tween;
	private productPulseTween?: Phaser.Tweens.Tween;
	private buttonPopTween?: Phaser.Tweens.Tween;

	/**
	 * Arranca la secuencia completa: barra de carga 0→100%, estrella y producto
	 * "latiendo" en loop, y al llegar a 100% el botón que reutiliza onContinue (la
	 * misma lógica que nextdayBtn, pasada por PanelPrefab) en vez de duplicarla acá.
	 */
	public playUnlockReveal(preview: LoaderUnlockPreview, onContinue: () => void) {
		this.stopUnlockAnimation();
		this.setVisible(true);

		this.productPreview.setTexture(preview.textureKey, preview.frame);
		this.unlockedThing.setText(preview.displayName);

		this.starTween = this.scene.tweens.add({
			targets: this.unlockStar,
			angle: 360,
			duration: LoaderUnlock.STAR_ROTATION_DURATION_MS,
			repeat: -1,
			ease: "Linear",
		});

		this.productPulseTween = this.scene.tweens.add({
			targets: this.productPreview,
			scaleX: this.productBaseScaleX * LoaderUnlock.PRODUCT_PULSE_SCALE,
			scaleY: this.productBaseScaleY * LoaderUnlock.PRODUCT_PULSE_SCALE,
			duration: LoaderUnlock.PRODUCT_PULSE_DURATION_MS,
			yoyo: true,
			repeat: -1,
			ease: "Sine.InOut",
		});

		const progress = { value: 0 };
		this.fillTween = this.scene.tweens.add({
			targets: progress,
			value: 1,
			duration: LoaderUnlock.FILL_DURATION_MS,
			ease: "Cubic.Out",
			onUpdate: () => {
				this.loaderFill.scaleX = progress.value;
				this.precentajeLoader.setText(`${Math.round(progress.value * 100)}%`);
			},
			onComplete: () => {
				this.precentajeLoader.setText("100%");
				this.revealContinueButton(onContinue);
			},
		});
	}

	private revealContinueButton(onContinue: () => void) {
		// La barra/fondo del loader ya cumplieron su función: se esconden para que no
		// tapen al botón (van por encima en la lista de hijos) y el texto de % pasa a
		// ser la etiqueta del botón.
		this.loaderBg.setVisible(false);
		this.loaderFill.setVisible(false);
		this.precentajeLoader.setText(LoaderUnlock.CONTINUE_TEXT);

		this.unlockedBtn.setVisible(true);
		this.unlockedBtn.setScale(0);
		// Back.Out ya sobrepasa el 1 y se asienta solo: cubre el "0 → 1.1 → 1" en un tween.
		this.buttonPopTween = this.scene.tweens.add({
			targets: this.unlockedBtn,
			scaleX: 1,
			scaleY: 1,
			duration: LoaderUnlock.BUTTON_POP_DURATION_MS,
			ease: "Back.Out",
		});

		this.unlockedBtn.setInteractive({ useHandCursor: true });
		this.unlockedBtn.removeAllListeners();
		this.unlockedBtn.once(Phaser.Input.Events.POINTER_DOWN, () => {
			this.unlockedBtn.disableInteractive();
			onContinue();
		});
	}

	/**
	 * Resetea todo a estado de reposo y oculto, y mata los tweens infinitos (estrella,
	 * pulso del producto) para que no sigan corriendo al cerrar el panel o pasar de día.
	 */
	public stopUnlockAnimation() {
		this.fillTween?.stop();
		this.fillTween = undefined;
		this.starTween?.stop();
		this.starTween = undefined;
		this.productPulseTween?.stop();
		this.productPulseTween = undefined;
		this.buttonPopTween?.stop();
		this.buttonPopTween = undefined;

		this.unlockedBtn.removeAllListeners();
		this.unlockedBtn.disableInteractive();
		this.unlockedBtn.setVisible(false);
		this.unlockedBtn.setScale(1);

		this.loaderBg.setVisible(true);
		this.loaderFill.setVisible(true);
		this.loaderFill.scaleX = 0;
		this.precentajeLoader.setText("0%");
		this.unlockStar.setAngle(0);
		this.productPreview.setScale(this.productBaseScaleX, this.productBaseScaleY);

		this.setVisible(false);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

export interface LoaderUnlockPreview {
	textureKey: string;
	frame?: string | number;
	displayName: string;
}

// You can write more code here
