import Phaser from "phaser";

export default class SmallHeartBurst extends Phaser.GameObjects.Container {

	private static readonly PARTICLE_COUNT = 7;
	private static readonly BURST_RADIUS_X = 30;
	private static readonly BURST_MIN_Y = -36;
	private static readonly BURST_MAX_Y = 8;
	private static readonly BURST_RISE_MIN = 14;
	private static readonly BURST_RISE_MAX = 28;
	private static readonly SPAWN_STAGGER_MS = 45;
	private static readonly FLOAT_DURATION_MS = 620;
	private static readonly FADE_OUT_DURATION_MS = 180;
	private static readonly DESTROY_BUFFER_MS = 60;
	private static readonly TEXTURE_KEY = "smallHeart";

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y);
		this.playBurst();
	}

	public static launchAt(scene: Phaser.Scene, x: number, y: number, depth = 0) {
		const burst = new SmallHeartBurst(scene, x, y);
		scene.add.existing(burst);
		burst.setDepth(depth);
		return burst;
	}

	private playBurst() {
		for (let index = 0; index < SmallHeartBurst.PARTICLE_COUNT; index++) {
			this.scene.time.delayedCall(index * SmallHeartBurst.SPAWN_STAGGER_MS, () => {
				if (!this.active) {
					return;
				}

				this.spawnParticle();
			});
		}

		const totalDuration = (
			(SmallHeartBurst.PARTICLE_COUNT - 1) * SmallHeartBurst.SPAWN_STAGGER_MS
			+ SmallHeartBurst.FLOAT_DURATION_MS
			+ SmallHeartBurst.FADE_OUT_DURATION_MS
			+ SmallHeartBurst.DESTROY_BUFFER_MS
		);

		this.scene.time.delayedCall(totalDuration, () => {
			if (this.active) {
				this.destroy();
			}
		});
	}

	private spawnParticle() {
		const startX = Phaser.Math.Between(-SmallHeartBurst.BURST_RADIUS_X, SmallHeartBurst.BURST_RADIUS_X);
		const startY = Phaser.Math.Between(SmallHeartBurst.BURST_MIN_Y, SmallHeartBurst.BURST_MAX_Y);
		const rise = Phaser.Math.Between(SmallHeartBurst.BURST_RISE_MIN, SmallHeartBurst.BURST_RISE_MAX);
		const particle = this.scene.add.image(startX, startY, SmallHeartBurst.TEXTURE_KEY);
		particle.setAlpha(0);
		particle.setScale(0.32 + Math.random() * 0.28);
		this.add(particle);

		this.scene.tweens.add({
			targets: particle,
			alpha: { from: 0, to: 1 },
			y: startY - rise,
			x: startX + Phaser.Math.Between(-12, 12),
			angle: Phaser.Math.Between(-12, 12),
			duration: SmallHeartBurst.FLOAT_DURATION_MS,
			ease: "Sine.Out",
			onComplete: () => {
				this.scene.tweens.add({
					targets: particle,
					alpha: 0,
					y: particle.y - 10,
					duration: SmallHeartBurst.FADE_OUT_DURATION_MS,
					ease: "Sine.In",
					onComplete: () => {
						particle.destroy();
					},
				});
			},
		});
	}
}