
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
import type AClient from "./AClient";
/* END-USER-IMPORTS */

export default class Cookie extends Phaser.GameObjects.Image {

	constructor(scene: Phaser.Scene, x?: number, y?: number, texture?: string, frame?: number | string) {
		super(scene, x ?? 0, y ?? 0, texture || "cookie", frame);

		/* START-USER-CTR-CODE */
		this.baseScaleX = this.scaleX;
		this.baseScaleY = this.scaleY;
		this.baseAngle = this.angle;
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */
	private static readonly SPAWN_POP_DURATION = 120;
	private static readonly FLIGHT_DURATION = 340;
	private static readonly SPIN_ANGLE = 360;
	private static readonly TARGET_Y_OFFSET = -48;
	private readonly baseScaleX: number;
	private readonly baseScaleY: number;
	private readonly baseAngle: number;

	public launchToClient(client: AClient, bonusWaitMs: number, onComplete?: () => void) {
		this.setScale(0);

		this.scene.tweens.add({
			targets: this,
			scaleX: this.baseScaleX,
			scaleY: this.baseScaleY,
			duration: Cookie.SPAWN_POP_DURATION,
			ease: "Back.Out",
			onComplete: () => {
				this.playSwooshSound();
				this.scene.tweens.add({
					targets: this,
					x: client.x,
					y: client.y + Cookie.TARGET_Y_OFFSET,
					angle: this.baseAngle + Cookie.SPIN_ANGLE,
					duration: Cookie.FLIGHT_DURATION,
					ease: "Cubic.InOut",
					onComplete: () => {
						this.angle = this.baseAngle;

						if (client.active && client.extendRequestWaitTime(bonusWaitMs)) {
							this.scene.sound.play(`eating${Phaser.Math.Between(1, 3)}`);
						}

						this.scene.tweens.add({
							targets: this,
							scaleX: 0,
							scaleY: 0,
							alpha: 0.7,
							duration: 100,
							ease: "Cubic.In",
							onComplete: () => {
								this.destroy();
								onComplete?.();
							}
						});
					}
				});
			}
		});
	}

	private playSwooshSound() {
		const swooshSoundKey = Phaser.Math.Between(0, 1) === 0 ? "swoosh" : "swoosh2";
		this.scene.sound.play(swooshSoundKey);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here