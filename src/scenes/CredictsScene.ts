
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
import SpineClient from "./Prefabs/SpineClient";
import { BODY_SKIN_MAX_INDEX, getClientBearName, getClientBearQuote } from "./clientBearCatalog";
import { getBearLikes } from "./likeProgress";
import { markCampaignCreditsSeen, unlockInfiniteMode } from "./levelProgress";

/** Datos de cada osito en la galería. Más adelante se rellenan con stats reales. */
interface CreditBearEntry {
	skinIndex: number;
	name: string;
	quote: string;
	likesGiven: number;
}
/* END-USER-IMPORTS */

export default class CredictsScene extends Phaser.Scene {

	constructor() {
		super("CredictsScene");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	editorCreate(): void {

		// Thankstext
		const thankstext = this.add.text(640, 92, "", {});
		thankstext.setOrigin(0.5, 0.5);
		thankstext.text = "Thanks for playing";
		thankstext.setStyle({ "color": "#EEA1A7", "fontFamily": "Klop", "fontSize": "54pt" });

		this.thankstext = thankstext;

		this.events.emit("scene-awake");
	}

	private thankstext!: Phaser.GameObjects.Text;

	/* START-USER-CODE */

	private static readonly CARD_WIDTH = 400;
	private static readonly CARD_HEIGHT = 260;
	private static readonly CARD_GAP = 36;
	private static readonly CARD_RADIUS = 30;
	private static readonly CARD_FILL = 0xF8D7DE;
	private static readonly PORTRAIT_SIZE = 176;
	private static readonly PORTRAIT_RADIUS = 24;
	private static readonly PORTRAIT_FILL = 0xF2B8C2;
	private static readonly PORTRAIT_STROKE = 0xC47A86;
	private static readonly PORTRAIT_STROKE_WIDTH = 6;
	/**
	 * AABB del skeleton ClientBear (json): altura ~171.
	 * Escala para llenar el retrato con un poco de margen.
	 */
	private static readonly BEAR_SCALE = 0.86;
	/**
	 * El AABB del spine está casi centrado en el root.
	 * Un offset grande (antes +48) sacaba los pies del marco.
	 */
	private static readonly BEAR_OFFSET_Y = 8;
	private static readonly GALLERY_Y = 345;
	private static readonly GALLERY_MASK_TOP = 165;
	private static readonly GALLERY_MASK_HEIGHT = 340;
	private static readonly SIDE_PEEK = 40;
	private static readonly TEXT_NAME_COLOR = "#C47A86";
	private static readonly TEXT_QUOTE_COLOR = "#5C3A32";
	private static readonly TEXT_LIKES_COLOR = "#E8A8B0";
	private static readonly INFINITE_LABEL_COLOR = "#E8A8B0";
	private static readonly INFINITE_BTN_Y = 615;
	private static readonly INFINITE_BTN_BASE_SCALE = 1.1;

	private scrollContainer?: Phaser.GameObjects.Container;
	private isDraggingGallery = false;
	private dragPointerId = -1;
	private dragStartX = 0;
	private scrollStartX = 0;
	private minScrollX = 0;
	private maxScrollX = 0;
	/** Velocidad horizontal del carrusel (px/s). */
	private scrollVelocityX = 0;
	private lastDragSampleX = 0;
	private lastDragSampleTime = 0;
	private lastAppliedScrollX = Number.NaN;
	private infiniteModeButton?: Phaser.GameObjects.Image;
	private infiniteModeButtonText?: Phaser.GameObjects.Text;
	private infiniteModeHint?: Phaser.GameObjects.Text;
	private infiniteModeCta?: Phaser.GameObjects.Container;
	private infiniteModePulseTween?: Phaser.Tweens.Tween;
	private infiniteModeHintTween?: Phaser.Tweens.Tween;
	private isHoveringInfiniteButton = false;
	/** Máscaras de retrato en coords de mundo (se refrescan al scrollear). */
	private portraitClips: Array<{
		maskGraphics: Phaser.GameObjects.Graphics;
		card: Phaser.GameObjects.Container;
		localX: number;
		localY: number;
	}> = [];

	/** Fricción por segundo al soltar (más bajo = se desliza más). */
	private static readonly SCROLL_FRICTION = 3.2;
	private static readonly SCROLL_MIN_VELOCITY = 18;
	private static readonly SCROLL_MAX_VELOCITY = 4200;
	private static readonly SCROLL_WHEEL_IMPULSE = 1.35;
	private static readonly SCROLL_DRAG_SMOOTHING = 0.55;
	/** Resistencia al tirar más allá de los bordes. */
	private static readonly SCROLL_OVERSCROLL_RESISTANCE = 0.35;
	private static readonly SCROLL_BOUNCE_STRENGTH = 14;

	create() {

		// Marca la celebración de campaña perfecta como ya vista (no se repite).
		markCampaignCreditsSeen();

		this.editorCreate();
		this.thankstext.setDepth(20);
		this.buildBearGallery();
		this.buildInfiniteModeCta();
		this.setupGalleryScrolling();
		this.refreshPortraitClips();
	}

	private getCreditBearEntries(): CreditBearEntry[] {
		// Nombre por head/skin; likes leídos del localStorage acumulado en partida.
		const entries: CreditBearEntry[] = [];

		for (let skinIndex = 0; skinIndex <= BODY_SKIN_MAX_INDEX; skinIndex++) {
			entries.push({
				skinIndex,
				name: getClientBearName(skinIndex),
				quote: getClientBearQuote(skinIndex),
				likesGiven: getBearLikes(skinIndex),
			});
		}

		return entries;
	}

	private buildBearGallery() {
		this.portraitClips = [];

		const entries = this.getCreditBearEntries();
		const cardStride = CredictsScene.CARD_WIDTH + CredictsScene.CARD_GAP;
		const totalWidth = entries.length * cardStride - CredictsScene.CARD_GAP;

		this.scrollContainer = this.add.container(0, CredictsScene.GALLERY_Y);
		this.scrollContainer.setDepth(10);

		entries.forEach((entry, index) => {
			const card = this.createBearCard(entry);
			// Primera carta empieza un poco fuera a la izquierda, como en el mockup.
			card.x = CredictsScene.SIDE_PEEK + CredictsScene.CARD_WIDTH * 0.5 + index * cardStride;
			this.scrollContainer?.add(card);
		});

		const viewportLeft = 0;
		const viewportRight = this.scale.width;
		const contentRight = CredictsScene.SIDE_PEEK + totalWidth;
		// scrollContainer.x se mueve; x=0 es la posición inicial del mockup.
		this.maxScrollX = 0;
		this.minScrollX = Math.min(0, viewportRight - contentRight - CredictsScene.SIDE_PEEK);

		// Si hay pocas cartas, centrar.
		if (totalWidth + CredictsScene.SIDE_PEEK * 2 < viewportRight - viewportLeft) {
			const centeredX = (this.scale.width - totalWidth) * 0.5 - CredictsScene.SIDE_PEEK;
			this.scrollContainer.x = centeredX;
			this.minScrollX = centeredX;
			this.maxScrollX = centeredX;
		}
	}

	/** Redibuja las máscaras de retrato en coordenadas de mundo (siguen al scroll). */
	private refreshPortraitClips(force = false) {
		if (!this.scrollContainer) {
			return;
		}

		const scrollX = this.scrollContainer.x;
		if (!force && scrollX === this.lastAppliedScrollX) {
			return;
		}

		this.lastAppliedScrollX = scrollX;

		const half = CredictsScene.PORTRAIT_SIZE * 0.5;
		const size = CredictsScene.PORTRAIT_SIZE;
		const radius = CredictsScene.PORTRAIT_RADIUS;
		const scrollY = this.scrollContainer.y;

		for (const clip of this.portraitClips) {
			const worldX = scrollX + clip.card.x + clip.localX;
			const worldY = scrollY + clip.card.y + clip.localY;

			clip.maskGraphics.clear();
			clip.maskGraphics.fillStyle(0xffffff, 1);
			clip.maskGraphics.fillRoundedRect(
				worldX - half,
				worldY - half,
				size,
				size,
				radius
			);
		}
	}

	/** Aplica posición de scroll; con overscroll suave fuera de los límites. */
	private setGalleryScrollX(nextX: number, allowOverscroll = false) {
		if (!this.scrollContainer) {
			return;
		}

		let targetX = nextX;

		if (allowOverscroll) {
			if (nextX > this.maxScrollX) {
				const excess = nextX - this.maxScrollX;
				targetX = this.maxScrollX + excess * CredictsScene.SCROLL_OVERSCROLL_RESISTANCE;
			} else if (nextX < this.minScrollX) {
				const excess = this.minScrollX - nextX;
				targetX = this.minScrollX - excess * CredictsScene.SCROLL_OVERSCROLL_RESISTANCE;
			}
		} else {
			targetX = Phaser.Math.Clamp(nextX, this.minScrollX, this.maxScrollX);
		}

		this.scrollContainer.x = targetX;
		this.refreshPortraitClips();
	}

	private sampleDragVelocity(pointerX: number) {
		const now = this.time.now;
		const dt = Math.max(1, now - this.lastDragSampleTime);
		const dx = pointerX - this.lastDragSampleX;
		const instantVelocity = (dx / dt) * 1000;

		// Mezcla para un deslizamiento más suave (menos “trémolo”).
		this.scrollVelocityX = Phaser.Math.Linear(
			this.scrollVelocityX,
			instantVelocity,
			CredictsScene.SCROLL_DRAG_SMOOTHING
		);
		this.scrollVelocityX = Phaser.Math.Clamp(
			this.scrollVelocityX,
			-CredictsScene.SCROLL_MAX_VELOCITY,
			CredictsScene.SCROLL_MAX_VELOCITY
		);

		this.lastDragSampleX = pointerX;
		this.lastDragSampleTime = now;
	}

	private stopScrollInertia() {
		this.scrollVelocityX = 0;
	}

	update(_time: number, delta: number) {
		if (!this.scrollContainer) {
			return;
		}

		const dt = Math.min(delta, 34) / 1000;

		if (this.isDraggingGallery) {
			return;
		}

		const x = this.scrollContainer.x;
		const outOfBounds = x > this.maxScrollX || x < this.minScrollX;

		// Rebote elástico al soltar fuera de rango.
		if (outOfBounds) {
			const target = x > this.maxScrollX ? this.maxScrollX : this.minScrollX;
			const pull = (target - x) * CredictsScene.SCROLL_BOUNCE_STRENGTH;
			this.scrollVelocityX += pull * dt;
			this.scrollVelocityX *= Math.exp(-CredictsScene.SCROLL_FRICTION * 1.6 * dt);
		} else if (Math.abs(this.scrollVelocityX) > CredictsScene.SCROLL_MIN_VELOCITY) {
			// Inercia con fricción exponencial (feeling de “glide”).
			this.scrollVelocityX *= Math.exp(-CredictsScene.SCROLL_FRICTION * dt);
		} else {
			this.scrollVelocityX = 0;
			// Snap suave al borde si quedó ligeramente fuera por float.
			if (x > this.maxScrollX || x < this.minScrollX) {
				this.setGalleryScrollX(Phaser.Math.Clamp(x, this.minScrollX, this.maxScrollX));
			}
			return;
		}

		if (Math.abs(this.scrollVelocityX) <= CredictsScene.SCROLL_MIN_VELOCITY && !outOfBounds) {
			this.scrollVelocityX = 0;
			return;
		}

		this.setGalleryScrollX(x + this.scrollVelocityX * dt, true);
	}

	private createBearCard(entry: CreditBearEntry) {
		const card = this.add.container(0, 0);
		const halfW = CredictsScene.CARD_WIDTH * 0.5;
		const halfH = CredictsScene.CARD_HEIGHT * 0.5;

		const panel = this.add.graphics();
		panel.fillStyle(CredictsScene.CARD_FILL, 1);
		panel.fillRoundedRect(
			-halfW,
			-halfH,
			CredictsScene.CARD_WIDTH,
			CredictsScene.CARD_HEIGHT,
			CredictsScene.CARD_RADIUS
		);
		card.add(panel);

		// Retrato a la izquierda, centrado en la carta.
		const portraitX = -halfW + 22 + CredictsScene.PORTRAIT_SIZE * 0.5;
		const portraitY = 0;
		const portraitHalf = CredictsScene.PORTRAIT_SIZE * 0.5;

		const portraitFill = this.add.graphics();
		portraitFill.fillStyle(CredictsScene.PORTRAIT_FILL, 1);
		portraitFill.fillRoundedRect(
			portraitX - portraitHalf,
			portraitY - portraitHalf,
			CredictsScene.PORTRAIT_SIZE,
			CredictsScene.PORTRAIT_SIZE,
			CredictsScene.PORTRAIT_RADIUS
		);
		card.add(portraitFill);

		// Capa del osito (container con setMask; SpineGameObject no tipa setMask en v4).
		const portraitLayer = this.add.container(portraitX, portraitY);
		card.add(portraitLayer);

		const bear = new SpineClient(
			this,
			this.spine,
			0,
			CredictsScene.BEAR_OFFSET_Y
		);
		bear.setScale(CredictsScene.BEAR_SCALE);
		bear.applyAppearanceVariant(entry.skinIndex);
		bear.playAnimation("idle", true);
		portraitLayer.add(bear);

		// Máscara de geometría en coords de mundo (Phaser 4) para recortar al marco.
		const maskGraphics = this.make.graphics({ x: 0, y: 0 });
		maskGraphics.setVisible(false);
		const portraitMask = maskGraphics.createGeometryMask();
		portraitLayer.setMask(portraitMask);
		this.portraitClips.push({
			maskGraphics,
			card,
			localX: portraitX,
			localY: portraitY,
		});

		// Borde del retrato por encima del spine (fuera de la máscara).
		const portraitStroke = this.add.graphics();
		portraitStroke.lineStyle(CredictsScene.PORTRAIT_STROKE_WIDTH, CredictsScene.PORTRAIT_STROKE, 1);
		portraitStroke.strokeRoundedRect(
			portraitX - portraitHalf,
			portraitY - portraitHalf,
			CredictsScene.PORTRAIT_SIZE,
			CredictsScene.PORTRAIT_SIZE,
			CredictsScene.PORTRAIT_RADIUS
		);
		card.add(portraitStroke);

		// Columna de texto: ancho limitado al borde derecho de la carta (evita cortar con la siguiente).
		const textLeft = portraitX + portraitHalf + 18;
		const textMaxWidth = Math.max(110, halfW - textLeft - 16);

		const nameText = this.add.text(textLeft, -halfH + 50, entry.name, {
			color: CredictsScene.TEXT_NAME_COLOR,
			fontFamily: "Klop",
			fontSize: "34px",
		});
		nameText.setOrigin(0, 0.5);
		card.add(nameText);

		const quoteText = this.add.text(textLeft, 2, entry.quote, {
			color: CredictsScene.TEXT_QUOTE_COLOR,
			fontFamily: "Klop",
			fontSize: "26px",
			wordWrap: { width: textMaxWidth },
			lineSpacing: 0,
			align: "left",
		});
		quoteText.setOrigin(0, 0.5);
		card.add(quoteText);

		const likesText = this.add.text(textLeft, halfH - 48, `${entry.likesGiven} likes given`, {
			color: CredictsScene.TEXT_LIKES_COLOR,
			fontFamily: "Klop",
			fontSize: "24px",
		});
		likesText.setOrigin(0, 0.5);
		card.add(likesText);

		return card;
	}

	private buildInfiniteModeCta() {
		this.infiniteModeCta = this.add.container(640, CredictsScene.INFINITE_BTN_Y);
		this.infiniteModeCta.setDepth(20);
		this.infiniteModeCta.setScale(CredictsScene.INFINITE_BTN_BASE_SCALE);

		this.infiniteModeHint = this.add.text(0, -56, "now available", {
			color: CredictsScene.INFINITE_LABEL_COLOR,
			fontFamily: "Klop",
			fontSize: "28px",
		});
		this.infiniteModeHint.setOrigin(0.5, 0.5);
		this.infiniteModeCta.add(this.infiniteModeHint);

		this.infiniteModeButton = this.add.image(0, 0, "onBtn");
		this.infiniteModeButton.setInteractive({ useHandCursor: true });
		this.infiniteModeCta.add(this.infiniteModeButton);

		this.infiniteModeButtonText = this.add.text(-2, -4, "Infinite mode", {
			color: "#F8ECDA",
			fontFamily: "Klop",
			fontSize: "36px",
		});
		this.infiniteModeButtonText.setOrigin(0.5, 0.5);
		this.infiniteModeCta.add(this.infiniteModeButtonText);

		// Badge "NEW" para reforzar que es feature nueva.
		const newBadge = this.add.container(118, -28);
		const badgeBg = this.add.graphics();
		badgeBg.fillStyle(0xFF5F7E, 1);
		badgeBg.fillRoundedRect(-28, -14, 56, 28, 12);
		badgeBg.lineStyle(3, 0xFFFFFF, 1);
		badgeBg.strokeRoundedRect(-28, -14, 56, 28, 12);
		const badgeText = this.add.text(0, -1, "NEW", {
			color: "#FFFFFF",
			fontFamily: "Klop",
			fontSize: "20px",
		});
		badgeText.setOrigin(0.5, 0.5);
		newBadge.add([badgeBg, badgeText]);
		this.infiniteModeCta.add(newBadge);

		this.startInfiniteModeNewEffect(newBadge);

		this.infiniteModeButton.on(Phaser.Input.Events.POINTER_OVER, () => {
			this.isHoveringInfiniteButton = true;
			this.infiniteModePulseTween?.pause();
			this.tweens.add({
				targets: this.infiniteModeCta,
				scaleX: CredictsScene.INFINITE_BTN_BASE_SCALE * 1.12,
				scaleY: CredictsScene.INFINITE_BTN_BASE_SCALE * 1.12,
				duration: 180,
				ease: "Back.Out",
			});
		});
		this.infiniteModeButton.on(Phaser.Input.Events.POINTER_OUT, () => {
			this.isHoveringInfiniteButton = false;
			this.tweens.add({
				targets: this.infiniteModeCta,
				scaleX: CredictsScene.INFINITE_BTN_BASE_SCALE,
				scaleY: CredictsScene.INFINITE_BTN_BASE_SCALE,
				duration: 160,
				ease: "Quad.Out",
				onComplete: () => {
					if (!this.isHoveringInfiniteButton) {
						this.infiniteModePulseTween?.resume();
					}
				},
			});
		});
		this.infiniteModeButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
			if (this.cache.audio.exists("pop3")) {
				this.sound.play("pop3");
			}

			// Desbloquea de forma persistente el botón de Infinite Mode en SceneSelector.
			unlockInfiniteMode();
			this.scene.start("SceneSelector");
		});
	}

	/** Pulso + badge + parpadeo para que se sienta como feature "nueva". */
	private startInfiniteModeNewEffect(newBadge: Phaser.GameObjects.Container) {
		if (!this.infiniteModeCta || !this.infiniteModeHint) {
			return;
		}

		this.infiniteModePulseTween?.stop();
		this.infiniteModeHintTween?.stop();

		this.infiniteModeCta.setScale(CredictsScene.INFINITE_BTN_BASE_SCALE);
		this.infiniteModeHint.setAlpha(1);

		this.infiniteModePulseTween = this.tweens.add({
			targets: this.infiniteModeCta,
			scaleX: CredictsScene.INFINITE_BTN_BASE_SCALE * 1.08,
			scaleY: CredictsScene.INFINITE_BTN_BASE_SCALE * 1.08,
			duration: 680,
			yoyo: true,
			repeat: -1,
			ease: "Sine.InOut",
		});

		const hintBaseY = this.infiniteModeHint.y;
		this.infiniteModeHintTween = this.tweens.add({
			targets: this.infiniteModeHint,
			alpha: { from: 1, to: 0.4 },
			y: hintBaseY - 5,
			duration: 480,
			yoyo: true,
			repeat: -1,
			ease: "Sine.InOut",
		});

		this.tweens.add({
			targets: newBadge,
			scaleX: 1.18,
			scaleY: 1.18,
			angle: { from: -8, to: 8 },
			duration: 420,
			yoyo: true,
			repeat: -1,
			ease: "Sine.InOut",
		});
	}

	private setupGalleryScrolling() {
		if (!this.scrollContainer) {
			return;
		}

		// Zona amplia de drag (no tapa el botón inferior).
		const dragZone = this.add.zone(
			this.scale.width * 0.5,
			CredictsScene.GALLERY_Y,
			this.scale.width,
			CredictsScene.GALLERY_MASK_HEIGHT
		);
		dragZone.setInteractive();
		dragZone.setDepth(5);

		const beginDrag = (pointer: Phaser.Input.Pointer) => {
			this.isDraggingGallery = true;
			this.dragPointerId = pointer.id;
			this.dragStartX = pointer.x;
			this.scrollStartX = this.scrollContainer?.x ?? 0;
			this.lastDragSampleX = pointer.x;
			this.lastDragSampleTime = this.time.now;
			this.stopScrollInertia();
		};

		const endDrag = (pointer?: Phaser.Input.Pointer) => {
			if (!this.isDraggingGallery) {
				return;
			}

			if (pointer && this.dragPointerId >= 0 && pointer.id !== this.dragPointerId) {
				return;
			}

			// Última muestra de velocidad al soltar.
			if (pointer) {
				this.sampleDragVelocity(pointer.x);
			}

			this.isDraggingGallery = false;
			this.dragPointerId = -1;

			// Si la velocidad es muy baja, no hay “flick”.
			if (Math.abs(this.scrollVelocityX) < CredictsScene.SCROLL_MIN_VELOCITY * 2) {
				this.scrollVelocityX = 0;
				// Si quedó en overscroll, deja que update haga el bounce.
				if (this.scrollContainer) {
					const x = this.scrollContainer.x;
					if (x > this.maxScrollX || x < this.minScrollX) {
						// Impulso mínimo hacia el borde para activar el spring.
						this.scrollVelocityX = x > this.maxScrollX ? -40 : 40;
					}
				}
			}
		};

		dragZone.on(Phaser.Input.Events.POINTER_DOWN, beginDrag);

		this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
			if (!this.isDraggingGallery || !this.scrollContainer || !pointer.isDown) {
				return;
			}

			if (this.dragPointerId >= 0 && pointer.id !== this.dragPointerId) {
				return;
			}

			this.sampleDragVelocity(pointer.x);
			const nextX = this.scrollStartX + (pointer.x - this.dragStartX);
			this.setGalleryScrollX(nextX, true);
		});

		this.input.on(Phaser.Input.Events.POINTER_UP, endDrag);
		this.input.on(Phaser.Input.Events.POINTER_UP_OUTSIDE, endDrag);

		this.input.on("wheel", (
			_pointer: Phaser.Input.Pointer,
			_gameObjects: Phaser.GameObjects.GameObject[],
			deltaX: number,
			deltaY: number
		) => {
			if (!this.scrollContainer) {
				return;
			}

			// La rueda empuja con inercia en lugar de un salto duro.
			const wheelDelta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
			this.scrollVelocityX -= wheelDelta * CredictsScene.SCROLL_WHEEL_IMPULSE * 60;
			this.scrollVelocityX = Phaser.Math.Clamp(
				this.scrollVelocityX,
				-CredictsScene.SCROLL_MAX_VELOCITY,
				CredictsScene.SCROLL_MAX_VELOCITY
			);
		});
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
