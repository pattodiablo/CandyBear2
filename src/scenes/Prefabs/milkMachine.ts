
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
import Phaser from "phaser";
/* END-USER-IMPORTS */

export type MilkSlotId = "milkRefill1" | "milkRefill2";

export default class milkMachine extends Phaser.GameObjects.Container {

	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? 0, y ?? 0);

		// milkmachine
		const milkmachine = scene.add.image(0, 0, "Milkmachine");
		this.add(milkmachine);

		// milkRefill1
		const milkRefill1 = scene.add.image(-52, 53, "_MISSING");
		milkRefill1.visible = false;
		this.add(milkRefill1);

		// milkRefill2
		const milkRefill2 = scene.add.image(53, 53, "_MISSING");
		milkRefill2.visible = false;
		this.add(milkRefill2);

		this.milkRefill1 = milkRefill1;
		this.milkRefill2 = milkRefill2;

		/* START-USER-CTR-CODE */
		this.machineBody = milkmachine;
		this.slotSprites = {
			milkRefill1: this.createSlotSprite(milkRefill1),
			milkRefill2: this.createSlotSprite(milkRefill2)
		};
		/* END-USER-CTR-CODE */
	}

	private milkRefill1: Phaser.GameObjects.Image;
	private milkRefill2: Phaser.GameObjects.Image;

	/* START-USER-CODE */
	private machineBody!: Phaser.GameObjects.Image;
	private static readonly DEFAULT_FRAME = "Vaso0001.png";
	private static readonly FILLED_FRAME = "Vaso0089.png";
	private readonly slotSprites: Record<MilkSlotId, Phaser.GameObjects.Sprite>;

	private createSlotSprite(marker: Phaser.GameObjects.Image) {

		const slotSprite = this.scene.add.sprite(
			marker.x,
			marker.y,
			"GlassAnim",
			milkMachine.DEFAULT_FRAME
		);

		slotSprite.visible = false;
		this.add(slotSprite);
		return slotSprite;
	}

	private getSlotMarker(slotId: MilkSlotId) {

		return slotId === "milkRefill1" ? this.milkRefill1 : this.milkRefill2;
	}

	private getSlotSprite(slotId: MilkSlotId) {

		return this.slotSprites[slotId];
	}

	public getSlotTarget(slotId: MilkSlotId) {

		const marker = this.getSlotMarker(slotId);
		const worldPoint = new Phaser.Math.Vector2();
		this.getWorldTransformMatrix().transformPoint(marker.x, marker.y, worldPoint);
		// Offset target slightly upward so milk glasses rest a bit above the marker
		worldPoint.y -= 10;
		return worldPoint;
	}

	public playMilkRefill(slotId: MilkSlotId, onComplete?: () => void) {

		const slotSprite = this.getSlotSprite(slotId);
		slotSprite.setVisible(true);
		slotSprite.setTexture("GlassAnim", milkMachine.DEFAULT_FRAME);
		slotSprite.stop();
		slotSprite.removeAllListeners(Phaser.Animations.Events.ANIMATION_COMPLETE);

		if (!this.scene.anims.exists("MilkRefill")) {
			slotSprite.setFrame(milkMachine.FILLED_FRAME);
			onComplete?.();
			return slotSprite;
		}

		slotSprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
			slotSprite.stop();
			this.scene.sound.play(`pop${Phaser.Math.Between(1, 3)}`);
			onComplete?.();
		});
		slotSprite.play({ key: "MilkRefill", repeat: 0 });
		return slotSprite;
	}

	public clearSlot(slotId: MilkSlotId) {

		const slotSprite = this.getSlotSprite(slotId);
		slotSprite.stop();
		slotSprite.setVisible(false);
		slotSprite.setTexture("GlassAnim", milkMachine.DEFAULT_FRAME);
	}

	public setMachineTexture(textureKey: string) {
		this.machineBody.setTexture(textureKey);
	}

	// Write your code here.

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
