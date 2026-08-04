
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
/* END-USER-IMPORTS */

export default class ConfettiPrefab extends Phaser.GameObjects.Image {
	private static readonly DEFAULT_X = 0;
	private static readonly DEFAULT_Y = 0;

	constructor(scene: Phaser.Scene, x?: number, y?: number, texture?: string, frame?: number | string) {
		super(scene, x ?? 0, y ?? 0, texture || "confetti9", frame);

		/* START-USER-CTR-CODE */
		this.setVisible(false);
		this.setActive(false);
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	private static readonly PARTICLE_TEXTURE_KEYS = [
		"confetti1",
		"confetti2",
		"confetti3",
		"confetti4",
		"confetti5",
		"confetti6",
		"confetti7",
		"confetti8",
		"confetti9",
		"confetti10"
	];
	private static readonly TOTAL_PARTICLE_COUNT = 180;
	private static readonly BURST_X_SPEED = 420;
	private static readonly BURST_Y_SPEED_MIN = 240;
	private static readonly BURST_Y_SPEED_MAX = 620;
	private static readonly GRAVITY_Y = 540;
	private static readonly ANGULAR_VELOCITY = 260;
	private static readonly PARTICLE_SCALE_MIN = 0.45;
	private static readonly PARTICLE_SCALE_MAX = 1;
	private static readonly PARTICLE_LIFESPAN = 4200;
	private static readonly EMITTER_Y_OFFSET = -20;
	private static readonly DESTROY_BUFFER_MS = 450;
	private static readonly DISPLAY_DEPTH = 1002;
	private static readonly CHEERS_VOLUME = 0.65;
	private static readonly SMALL_BURST_EMITTER_COUNT = 3;
	private static readonly SMALL_BURST_PARTICLES_PER_EMITTER = 4;
	private static readonly SMALL_BURST_LIFESPAN = 900;
	private static readonly SMALL_BURST_GRAVITY_Y = 320;
	private static readonly SMALL_BURST_SPEED_MIN = 60;
	private static readonly SMALL_BURST_SPEED_MAX = 150;
	private static readonly SMALL_BURST_SCALE_MIN = 0.3;
	private static readonly SMALL_BURST_SCALE_MAX = 0.55;
	private static readonly SMALL_BURST_DESTROY_BUFFER_MS = 200;
	/** Burst de desbloqueo de estación/producto: un poco más grande y alegre. */
	private static readonly UNLOCK_BURST_EMITTER_COUNT = 5;
	private static readonly UNLOCK_BURST_PARTICLES_PER_EMITTER = 6;
	private static readonly UNLOCK_BURST_LIFESPAN = 1100;
	private static readonly UNLOCK_BURST_GRAVITY_Y = 380;
	private static readonly UNLOCK_BURST_SPEED_MIN = 90;
	private static readonly UNLOCK_BURST_SPEED_MAX = 220;
	private static readonly UNLOCK_BURST_SCALE_MIN = 0.35;
	private static readonly UNLOCK_BURST_SCALE_MAX = 0.7;
	private static readonly UNLOCK_BURST_DESTROY_BUFFER_MS = 250;
	private static readonly UNLOCK_CHEERS_VOLUME = 0.4;
	private readonly emitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];

	public burst() {
		this.playBurst();
	}

	public static launch(scene: Phaser.Scene) {
		const confetti = new ConfettiPrefab(scene, ConfettiPrefab.DEFAULT_X, ConfettiPrefab.DEFAULT_Y);
		scene.add.existing(confetti);
		confetti.setDepth(ConfettiPrefab.DISPLAY_DEPTH);
		confetti.burst();
		return confetti;
	}

	public static launchSmallBurstAt(
		scene: Phaser.Scene,
		x: number,
		y: number,
		depth = ConfettiPrefab.DISPLAY_DEPTH
	) {
		const confetti = new ConfettiPrefab(scene, x, y);
		scene.add.existing(confetti);
		confetti.setDepth(depth);
		confetti.playSmallBurst();
		return confetti;
	}

	/**
	 * Burst local al desbloquear un objeto de cocina (freidora, milk machine, etc.).
	 * Más notorio que el burst de estela, sin ser el confeti a pantalla completa.
	 */
	public static launchUnlockBurstAt(
		scene: Phaser.Scene,
		x: number,
		y: number,
		depth = ConfettiPrefab.DISPLAY_DEPTH
	) {
		const confetti = new ConfettiPrefab(scene, x, y);
		scene.add.existing(confetti);
		confetti.setDepth(depth);
		confetti.playUnlockBurst();
		return confetti;
	}

	/**
	 * Estela de confeti que viaja de un punto a otro (p. ej. like → tarro de galletas).
	 * Deja migas de confeti en el camino y un pequeño burst al llegar.
	 */
	public static launchTravelTrail(
		scene: Phaser.Scene,
		fromX: number,
		fromY: number,
		toX: number,
		toY: number,
		onArrive?: () => void,
		depth = ConfettiPrefab.DISPLAY_DEPTH
	) {
		const confetti = new ConfettiPrefab(scene, fromX, fromY);
		scene.add.existing(confetti);
		confetti.setDepth(depth);
		confetti.playTravelTrail(fromX, fromY, toX, toY, onArrive);
		return confetti;
	}

	private playBurst() {
		const emitterX = this.scene.scale.width * 0.5;
		const emitterY = ConfettiPrefab.EMITTER_Y_OFFSET;
		const textureKeys = Phaser.Utils.Array.Shuffle([...ConfettiPrefab.PARTICLE_TEXTURE_KEYS]);
		const baseBurstCount = Math.floor(ConfettiPrefab.TOTAL_PARTICLE_COUNT / textureKeys.length);
		let remainingParticles = ConfettiPrefab.TOTAL_PARTICLE_COUNT;

		this.scene.sound.play("cheersSound", { volume: ConfettiPrefab.CHEERS_VOLUME });
		this.setPosition(emitterX, emitterY);

		textureKeys.forEach((textureKey, index) => {
			const burstCount = index === textureKeys.length - 1
				? remainingParticles
				: Phaser.Math.Between(Math.max(8, baseBurstCount - 5), baseBurstCount + 5);

			remainingParticles -= burstCount;

			const emitter = this.scene.add.particles(0, 0, textureKey, {
				x: { min: 0, max: this.scene.scale.width },
				y: emitterY,
				lifespan: ConfettiPrefab.PARTICLE_LIFESPAN,
				gravityY: ConfettiPrefab.GRAVITY_Y,
				speedX: { min: -ConfettiPrefab.BURST_X_SPEED, max: ConfettiPrefab.BURST_X_SPEED },
				speedY: { min: ConfettiPrefab.BURST_Y_SPEED_MIN, max: ConfettiPrefab.BURST_Y_SPEED_MAX },
				angle: { min: 80, max: 100 },
				rotate: { min: 0, max: 360 },
				scale: { start: Phaser.Math.FloatBetween(ConfettiPrefab.PARTICLE_SCALE_MIN, ConfettiPrefab.PARTICLE_SCALE_MAX), end: 0.2 },
				alpha: { start: 1, end: 0 },
				emitting: false,
				blendMode: Phaser.BlendModes.NORMAL
			});

			emitter.setDepth(ConfettiPrefab.DISPLAY_DEPTH);
			emitter.explode(burstCount);
			this.emitters.push(emitter);
		});

		this.scene.time.delayedCall(
			ConfettiPrefab.PARTICLE_LIFESPAN + ConfettiPrefab.DESTROY_BUFFER_MS,
			() => this.destroy()
		);
	}

	private playSmallBurst() {
		this.playLocalBurst({
			emitterCount: ConfettiPrefab.SMALL_BURST_EMITTER_COUNT,
			particlesPerEmitter: ConfettiPrefab.SMALL_BURST_PARTICLES_PER_EMITTER,
			lifespan: ConfettiPrefab.SMALL_BURST_LIFESPAN,
			gravityY: ConfettiPrefab.SMALL_BURST_GRAVITY_Y,
			speedMin: ConfettiPrefab.SMALL_BURST_SPEED_MIN,
			speedMax: ConfettiPrefab.SMALL_BURST_SPEED_MAX,
			scaleMin: ConfettiPrefab.SMALL_BURST_SCALE_MIN,
			scaleMax: ConfettiPrefab.SMALL_BURST_SCALE_MAX,
			destroyBufferMs: ConfettiPrefab.SMALL_BURST_DESTROY_BUFFER_MS,
		});
	}

	private playUnlockBurst() {
		if (this.scene.cache.audio.exists("cheersSound")) {
			this.scene.sound.play("cheersSound", { volume: ConfettiPrefab.UNLOCK_CHEERS_VOLUME });
		}

		this.playLocalBurst({
			emitterCount: ConfettiPrefab.UNLOCK_BURST_EMITTER_COUNT,
			particlesPerEmitter: ConfettiPrefab.UNLOCK_BURST_PARTICLES_PER_EMITTER,
			lifespan: ConfettiPrefab.UNLOCK_BURST_LIFESPAN,
			gravityY: ConfettiPrefab.UNLOCK_BURST_GRAVITY_Y,
			speedMin: ConfettiPrefab.UNLOCK_BURST_SPEED_MIN,
			speedMax: ConfettiPrefab.UNLOCK_BURST_SPEED_MAX,
			scaleMin: ConfettiPrefab.UNLOCK_BURST_SCALE_MIN,
			scaleMax: ConfettiPrefab.UNLOCK_BURST_SCALE_MAX,
			destroyBufferMs: ConfettiPrefab.UNLOCK_BURST_DESTROY_BUFFER_MS,
		});
	}

	private playLocalBurst(config: {
		emitterCount: number;
		particlesPerEmitter: number;
		lifespan: number;
		gravityY: number;
		speedMin: number;
		speedMax: number;
		scaleMin: number;
		scaleMax: number;
		destroyBufferMs: number;
	}) {
		const textureKeys = Phaser.Utils.Array.Shuffle([...ConfettiPrefab.PARTICLE_TEXTURE_KEYS])
			.slice(0, config.emitterCount);

		textureKeys.forEach((textureKey) => {
			const emitter = this.scene.add.particles(this.x, this.y, textureKey, {
				lifespan: config.lifespan,
				gravityY: config.gravityY,
				speed: {
					min: config.speedMin,
					max: config.speedMax,
				},
				angle: { min: 0, max: 360 },
				rotate: { min: 0, max: 360 },
				scale: {
					start: Phaser.Math.FloatBetween(config.scaleMin, config.scaleMax),
					end: 0.1,
				},
				alpha: { start: 1, end: 0 },
				emitting: false,
				blendMode: Phaser.BlendModes.NORMAL,
			});

			emitter.setDepth(this.depth);
			emitter.explode(config.particlesPerEmitter);
			this.emitters.push(emitter);
		});

		this.scene.time.delayedCall(
			config.lifespan + config.destroyBufferMs,
			() => this.destroy()
		);
	}

	private static readonly TRAIL_DURATION = 620;
	private static readonly TRAIL_CRUMB_INTERVAL = 45;
	private static readonly TRAIL_LEAD_SCALE = 0.55;
	private static readonly TRAIL_CRUMB_SCALE = 0.28;
	private static readonly TRAIL_ARC_HEIGHT_MIN = 50;
	private static readonly TRAIL_ARC_HEIGHT_MAX = 110;
	private static readonly TRAIL_SPIN = 420;

	private playTravelTrail(
		fromX: number,
		fromY: number,
		toX: number,
		toY: number,
		onArrive?: () => void
	) {
		const textureKey = Phaser.Utils.Array.GetRandom([...ConfettiPrefab.PARTICLE_TEXTURE_KEYS]);
		const lead = this.scene.add.image(fromX, fromY, textureKey);
		lead.setDepth(this.depth);
		lead.setScale(ConfettiPrefab.TRAIL_LEAD_SCALE);
		lead.setAlpha(1);

		const controlX = (fromX + toX) * 0.5 + Phaser.Math.Between(-48, 48);
		const controlY = Math.min(fromY, toY)
			- Phaser.Math.Between(
				ConfettiPrefab.TRAIL_ARC_HEIGHT_MIN,
				ConfettiPrefab.TRAIL_ARC_HEIGHT_MAX
			);

		const pathState = { t: 0 };
		let lastCrumbAt = -ConfettiPrefab.TRAIL_CRUMB_INTERVAL;

		this.scene.tweens.add({
			targets: pathState,
			t: 1,
			duration: ConfettiPrefab.TRAIL_DURATION,
			ease: "Sine.InOut",
			onUpdate: () => {
				if (!lead.active) {
					return;
				}

				const t = pathState.t;
				const inv = 1 - t;
				// Curva cuadrática: arco suave hacia el tarro.
				lead.x = inv * inv * fromX + 2 * inv * t * controlX + t * t * toX;
				lead.y = inv * inv * fromY + 2 * inv * t * controlY + t * t * toY;
				lead.angle = t * ConfettiPrefab.TRAIL_SPIN;
				lead.setScale(Phaser.Math.Linear(
					ConfettiPrefab.TRAIL_LEAD_SCALE,
					ConfettiPrefab.TRAIL_CRUMB_SCALE,
					t
				));

				const elapsed = t * ConfettiPrefab.TRAIL_DURATION;

				if (elapsed - lastCrumbAt >= ConfettiPrefab.TRAIL_CRUMB_INTERVAL) {
					lastCrumbAt = elapsed;
					this.spawnTrailCrumb(lead.x, lead.y);
				}
			},
			onComplete: () => {
				if (lead.active) {
					lead.destroy();
				}

				ConfettiPrefab.launchSmallBurstAt(this.scene, toX, toY, this.depth);
				onArrive?.();
				this.destroy();
			},
		});
	}

	private spawnTrailCrumb(x: number, y: number) {
		const textureKey = Phaser.Utils.Array.GetRandom([...ConfettiPrefab.PARTICLE_TEXTURE_KEYS]);
		const crumb = this.scene.add.image(x, y, textureKey);
		crumb.setDepth(this.depth - 1);
		crumb.setScale(ConfettiPrefab.TRAIL_CRUMB_SCALE * Phaser.Math.FloatBetween(0.7, 1.1));
		crumb.setAngle(Phaser.Math.Between(0, 360));
		crumb.setAlpha(0.9);

		this.scene.tweens.add({
			targets: crumb,
			alpha: 0,
			scaleX: 0.05,
			scaleY: 0.05,
			angle: crumb.angle + Phaser.Math.Between(-80, 80),
			y: y + Phaser.Math.Between(8, 22),
			duration: 280,
			ease: "Quad.In",
			onComplete: () => {
				if (crumb.active) {
					crumb.destroy();
				}
			},
		});
	}

	override destroy(fromScene?: boolean) {
		this.emitters.forEach((emitter) => emitter.destroy());
		this.emitters.length = 0;
		super.destroy(fromScene);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
