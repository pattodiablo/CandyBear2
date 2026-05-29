
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class YumPrefab extends Phaser.GameObjects.Container {

	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? 0, y ?? 0);

		// clientQuestion
		const clientQuestion = scene.add.image(0, 11, "ClientQuestion");
		this.add(clientQuestion);

		// yumyumText
		const yumyumText = scene.add.image(0, 0, "yumyumText");
		this.add(yumyumText);

		// smallHeart
		const smallHeart = scene.add.image(-34, 75, "smallHeart");
		this.add(smallHeart);

		// smallStar
		const smallStar = scene.add.image(39, 77, "smallStar");
		this.add(smallStar);

		this.clientQuestion = clientQuestion;
		this.yumyumText = yumyumText;
		this.smallHeart = smallHeart;
		this.smallStar = smallStar;

		/* START-USER-CTR-CODE */
		this.clientQuestion.setAlpha(0);
		this.clientQuestion.y += 24;
		this.yumyumText.setScale(0);
		this.smallHeart.setVisible(false);
		this.smallStar.setVisible(false);
		this.scene.tweens.add({
			targets: this.clientQuestion,
			alpha: 1,
			y: this.clientQuestion.y - 24,
			duration: 260,
			ease: "Sine.Out",
			onComplete: () => {
				this.scene.tweens.add({
					targets: this.yumyumText,
					scaleX: 1,
					scaleY: 1,
					duration: 240,
					ease: "Back.Out",
					onComplete: () => {
						this.playAccentBurst();
					}
				});
			}
		});
		/* END-USER-CTR-CODE */
	}

	private clientQuestion: Phaser.GameObjects.Image;
	private yumyumText: Phaser.GameObjects.Image;
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

		for (let index = 0; index < YumPrefab.BURST_COUNT; index++) {
			this.scene.time.delayedCall(index * YumPrefab.BURST_SPAWN_STAGGER, () => {
				if (!this.active) {
					return;
				}

				this.spawnAccentParticle(Math.random() < 0.5 ? this.smallHeart.texture.key : this.smallStar.texture.key);
			});
		}

		const burstTotalDuration = ((YumPrefab.BURST_COUNT - 1) * YumPrefab.BURST_SPAWN_STAGGER) + YumPrefab.BURST_DURATION + YumPrefab.OUTRO_DELAY;
		this.scene.time.delayedCall(burstTotalDuration, () => {
			this.playOutro();
		});
	}

	private spawnAccentParticle(textureKey: string) {

		const startX = Phaser.Math.Between(-YumPrefab.BURST_RADIUS_X, YumPrefab.BURST_RADIUS_X);
		const startY = Phaser.Math.Between(YumPrefab.BURST_MIN_Y, YumPrefab.BURST_MAX_Y);
		const particle = this.scene.add.image(startX, startY, textureKey);
		particle.setAlpha(0);
		particle.setScale(0.7 + Math.random() * 0.35);
		this.add(particle);

		this.scene.tweens.add({
			targets: particle,
			alpha: { from: 0, to: 1 },
			y: startY - YumPrefab.BURST_RISE,
			x: startX + Phaser.Math.Between(-12, 12),
			duration: YumPrefab.BURST_DURATION,
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
			targets: [this.clientQuestion, this.yumyumText],
			alpha: 0,
			duration: YumPrefab.OUTRO_DURATION,
			ease: "Sine.In",
			onComplete: () => {
				this.destroy();
			}
		});
	}

	// Write your code here.

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
