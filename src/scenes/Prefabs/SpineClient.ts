
// You can write more code here

/* START OF COMPILED CODE */

import { SpineGameObject } from "@esotericsoftware/spine-phaser";
import { SpinePlugin } from "@esotericsoftware/spine-phaser";
import { SpineGameObjectBoundsProvider } from "@esotericsoftware/spine-phaser";
import { SkinsAndAnimationBoundsProvider } from "@esotericsoftware/spine-phaser";
/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class SpineClient extends SpineGameObject {

	constructor(scene: Phaser.Scene, plugin: SpinePlugin, x: number, y: number, dataKey?: string, atlasKey?: string, skin?: string, boundsProvider?: SpineGameObjectBoundsProvider, xargs?: any) {
		super(scene, plugin, x ?? 0, y ?? 0, dataKey ?? "ClientBearSpine", atlasKey ?? "ClientBear-atlas", boundsProvider ?? new SkinsAndAnimationBoundsProvider("idle", ["default"]));

		this.skeleton.setSkinByName(skin ?? "default");

		/* START-USER-CTR-CODE */
		scene.sys.updateList.add(this);
		this.randomizeAppearance();
		this.playAnimation("idle");
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	private randomizeAppearance() {

		const useSkin1Variant = Math.random() < 0.5;
		const bodyAttachment = useSkin1Variant ? "bodySkin1" : "body";
		const headAttachment = useSkin1Variant ? "headSkin1" : "head";

		this.skeleton.setAttachment("body", bodyAttachment);
		this.skeleton.setAttachment("head", headAttachment);
	}

	public playAnimation(animationName: string, loop = true) {

		const currentTrack = this.animationState.getTrack(0);

		if (currentTrack?.animation?.name === animationName && currentTrack.loop === loop) {
			return;
		}

		this.animationState.setAnimation(0, animationName, loop);
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
