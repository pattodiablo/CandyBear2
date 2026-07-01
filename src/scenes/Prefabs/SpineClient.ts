
// You can write more code here

/* START OF COMPILED CODE */

import { SpineGameObject } from "@esotericsoftware/spine-phaser";
import { SpinePlugin } from "@esotericsoftware/spine-phaser";
import { SpineGameObjectBoundsProvider } from "@esotericsoftware/spine-phaser";
import { SkinsAndAnimationBoundsProvider } from "@esotericsoftware/spine-phaser";
/* START-USER-IMPORTS */
import Phaser from "phaser";
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

	private static readonly APPEARANCE_VARIANTS = SpineClient.buildAppearanceVariants();

	private appearanceVariantIndex = 0;

	private static getHeadAttachmentName(skinIndex: number) {
		if (skinIndex === 0) {
			return "head";
		}

		if ([7, 8, 12, 13].includes(skinIndex)) {
			return `headskin${skinIndex}`;
		}

		return `headSkin${skinIndex}`;
	}

	private static buildAppearanceVariants() {
		const variants = [{ body: "body", head: "head" }];

		for (let skinIndex = 1; skinIndex <= 15; skinIndex++) {
			variants.push({
				body: `bodySkin${skinIndex}`,
				head: SpineClient.getHeadAttachmentName(skinIndex),
			});
		}

		return variants;
	}

	private randomizeAppearance() {

		this.appearanceVariantIndex = Phaser.Math.Between(
			0,
			SpineClient.APPEARANCE_VARIANTS.length - 1
		);
		const variant = SpineClient.APPEARANCE_VARIANTS[this.appearanceVariantIndex];

		this.skeleton.setAttachment("body", variant.body);
		this.skeleton.setAttachment("head", variant.head);
	}

	public getAppearanceVariantIndex() {
		return this.appearanceVariantIndex;
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
