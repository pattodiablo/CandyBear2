
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
		const textureKeys = Phaser.Utils.Array.Shuffle([...ConfettiPrefab.PARTICLE_TEXTURE_KEYS])
			.slice(0, ConfettiPrefab.SMALL_BURST_EMITTER_COUNT);

		textureKeys.forEach((textureKey) => {
			const emitter = this.scene.add.particles(this.x, this.y, textureKey, {
				lifespan: ConfettiPrefab.SMALL_BURST_LIFESPAN,
				gravityY: ConfettiPrefab.SMALL_BURST_GRAVITY_Y,
				speed: {
					min: ConfettiPrefab.SMALL_BURST_SPEED_MIN,
					max: ConfettiPrefab.SMALL_BURST_SPEED_MAX,
				},
				angle: { min: 0, max: 360 },
				rotate: { min: 0, max: 360 },
				scale: {
					start: Phaser.Math.FloatBetween(
						ConfettiPrefab.SMALL_BURST_SCALE_MIN,
						ConfettiPrefab.SMALL_BURST_SCALE_MAX
					),
					end: 0.1,
				},
				alpha: { start: 1, end: 0 },
				emitting: false,
				blendMode: Phaser.BlendModes.NORMAL,
			});

			emitter.setDepth(this.depth);
			emitter.explode(ConfettiPrefab.SMALL_BURST_PARTICLES_PER_EMITTER);
			this.emitters.push(emitter);
		});

		this.scene.time.delayedCall(
			ConfettiPrefab.SMALL_BURST_LIFESPAN + ConfettiPrefab.SMALL_BURST_DESTROY_BUFFER_MS,
			() => this.destroy()
		);
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
