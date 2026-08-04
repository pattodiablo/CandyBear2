
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class AlmostPrefab extends Phaser.GameObjects.Container {

	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? 0, y ?? 0);

		// almostIcon
		const almostIcon = scene.add.image(0, 0, "almostIcon");
		this.add(almostIcon);

		// smallHeart
		const smallHeart = scene.add.image(-37, 50, "smallHeart");
		this.add(smallHeart);

		// smallStar
		const smallStar = scene.add.image(36, 52, "smallStar");
		this.add(smallStar);

		this.almostIcon = almostIcon;
		this.smallHeart = smallHeart;
		this.smallStar = smallStar;

		/* START-USER-CTR-CODE */
		this.almostIcon.setScale(0);
		this.smallHeart.setVisible(false);
		this.smallStar.setVisible(false);
		this.scene.tweens.add({
			targets: this.almostIcon,
			scaleX: 1,
			scaleY: 1,
			duration: 280,
			ease: "Back.Out",
			onComplete: () => {
				this.playAccentBurst();
			}
		});
		/* END-USER-CTR-CODE */
	}

	private almostIcon: Phaser.GameObjects.Image;
	private smallHeart: Phaser.GameObjects.Image;
	private smallStar: Phaser.GameObjects.Image;

	/* START-USER-CODE */
	private static readonly BURST_COUNT = 10;
	private static readonly BURST_RADIUS_X = 46;
	private static readonly BURST_MIN_Y = -8;
	private static readonly BURST_MAX_Y = 34;
	private static readonly BURST_RISE = 22;
	private static readonly BURST_SPAWN_STAGGER = 60;
	private static readonly BURST_DURATION = 420;
	private static readonly OUTRO_DELAY = 120;
	private static readonly OUTRO_DURATION = 180;

	private playAccentBurst() {

		for (let index = 0; index < AlmostPrefab.BURST_COUNT; index++) {
			this.scene.time.delayedCall(index * AlmostPrefab.BURST_SPAWN_STAGGER, () => {
				if (!this.active) {
					return;
				}

				this.spawnAccentParticle(Math.random() < 0.5 ? this.smallHeart.texture.key : this.smallStar.texture.key);
			});
		}

		const burstTotalDuration = ((AlmostPrefab.BURST_COUNT - 1) * AlmostPrefab.BURST_SPAWN_STAGGER) + AlmostPrefab.BURST_DURATION + AlmostPrefab.OUTRO_DELAY;
		this.scene.time.delayedCall(burstTotalDuration, () => {
			this.playOutro();
		});
	}

	private spawnAccentParticle(textureKey: string) {

		const startX = Phaser.Math.Between(-AlmostPrefab.BURST_RADIUS_X, AlmostPrefab.BURST_RADIUS_X);
		const startY = Phaser.Math.Between(AlmostPrefab.BURST_MIN_Y, AlmostPrefab.BURST_MAX_Y);
		const particle = this.scene.add.image(startX, startY, textureKey);
		particle.setAlpha(0);
		particle.setScale(0.7 + Math.random() * 0.35);
		this.add(particle);

		this.scene.tweens.add({
			targets: particle,
			alpha: { from: 0, to: 1 },
			y: startY - AlmostPrefab.BURST_RISE,
			x: startX + Phaser.Math.Between(-12, 12),
			duration: AlmostPrefab.BURST_DURATION,
			ease: "Sine.Out",
			onComplete: () => {
				this.scene.tweens.add({
					targets: particle,
					alpha: 0,
					duration: 140,
					ease: "Sine.In",
					onComplete: () => {
						particle.destroy();
					}
				});
			}
		});
	}

	private playOutro() {

		this.scene.tweens.add({
			targets: this.almostIcon,
			alpha: 0,
			scaleX: 0.85,
			scaleY: 0.85,
			duration: AlmostPrefab.OUTRO_DURATION,
			ease: "Sine.In",
			onComplete: () => {
				this.destroy();
			}
		});
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
