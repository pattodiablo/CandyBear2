
// You can write more code here

/* START OF COMPILED CODE */

import { SpineGameObject } from "@esotericsoftware/spine-phaser";
import { SpinePlugin } from "@esotericsoftware/spine-phaser";
import { SpineGameObjectBoundsProvider } from "@esotericsoftware/spine-phaser";
import { SkinsAndAnimationBoundsProvider } from "@esotericsoftware/spine-phaser";
/* START-USER-IMPORTS */
import Phaser from "phaser";
import {
	BODY_SKIN_MAX_INDEX,
	getClientBearProfile,
	pickClientBearSkinIndex,
	type ClientBearProfile,
} from "../clientBearCatalog";
/* END-USER-IMPORTS */

export default class SpineClient extends SpineGameObject {

	constructor(scene: Phaser.Scene, plugin: SpinePlugin, x: number, y: number, dataKey?: string, atlasKey?: string, skin?: string, boundsProvider?: SpineGameObjectBoundsProvider, xargs?: any) {
		super(scene, plugin, x ?? 0, y ?? 0, dataKey ?? "ClientBearSpine", atlasKey ?? "ClientBear-atlas", boundsProvider ?? new SkinsAndAnimationBoundsProvider("idle", ["default"]));

		this.skeleton.setSkinByName(skin ?? "default");

		/* START-USER-CTR-CODE */
		scene.sys.updateList.add(this);
		this.applyAppearanceVariant(0);
		this.playAnimation("idle");
		/* END-USER-CTR-CODE */
	}

	/* START-USER-CODE */

	private static readonly APPEARANCE_VARIANTS = SpineClient.buildAppearanceVariants();

	private appearanceVariantIndex = 0;
	private bearProfile: ClientBearProfile = getClientBearProfile(0);

	private static getHeadAttachmentName(skinIndex: number) {
		if (skinIndex === 0) {
			return "head";
		}

		return `headSkin${skinIndex}`;
	}

	private resolveHeadAttachmentName(skinIndex: number) {
		const preferredName = SpineClient.getHeadAttachmentName(skinIndex);
		const fallbackName = preferredName === "head"
			? preferredName
			: preferredName.replace("headSkin", "headskin");

		for (const attachmentName of [preferredName, fallbackName]) {
			if (this.skeleton.getAttachment("head", attachmentName)) {
				return attachmentName;
			}
		}

		return preferredName;
	}

	private static buildAppearanceVariants() {
		const variants = [{ body: "body", head: "head" }];

		for (let skinIndex = 1; skinIndex <= BODY_SKIN_MAX_INDEX; skinIndex++) {
			variants.push({
				body: `bodySkin${skinIndex}`,
				head: SpineClient.getHeadAttachmentName(skinIndex),
			});
		}

		return variants;
	}

	public applyAppearanceVariant(skinIndex: number) {
		this.appearanceVariantIndex = Phaser.Math.Clamp(
			Math.floor(skinIndex),
			0,
			SpineClient.APPEARANCE_VARIANTS.length - 1
		);
		this.bearProfile = getClientBearProfile(this.appearanceVariantIndex);
		const variant = SpineClient.APPEARANCE_VARIANTS[this.appearanceVariantIndex];

		this.skeleton.setAttachment("body", variant.body);
		this.skeleton.setAttachment(
			"head",
			this.resolveHeadAttachmentName(this.appearanceVariantIndex)
		);
	}

	/** Elige un skin desbloqueado según nivel/dificultad y lo aplica. */
	public randomizeAppearanceForLevel(levelNumber: number, difficulty: number) {
		const skinIndex = pickClientBearSkinIndex(levelNumber, difficulty);
		this.applyAppearanceVariant(skinIndex);
	}

	public getAppearanceVariantIndex() {
		return this.appearanceVariantIndex;
	}

	public getBearProfile() {
		return this.bearProfile;
	}

	public getWaitMultiplier() {
		return this.bearProfile.waitMultiplier;
	}

	public getLikeChance() {
		return this.bearProfile.likeChance;
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
