
// You can write more code here

/* START OF COMPILED CODE */

import UpgradeObject from "./UpgradeObject";
/* START-USER-IMPORTS */
import type { UnlockId } from "../unlockCatalog";
/* END-USER-IMPORTS */

export default class UpgradePanel extends Phaser.GameObjects.Container {

	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? -76, y ?? 0);

		// upgradeRainbow
		const upgradeRainbow = scene.add.image(0, 0, "upgradeRainbow");
		this.add(upgradeRainbow);

		// upgradeBg
		const upgradeBg = scene.add.image(0, 0, "UpgradeBg");
		this.add(upgradeBg);

		// text_1
		const text_1 = scene.add.text(1, -208, "", {});
		text_1.setOrigin(0.5, 0.5);
		text_1.text = "New Unlock";
		text_1.setStyle({ "color": "#DF3D7A", "fontFamily": "Klop", "fontSize": "40pt" });
		this.add(text_1);

		// container_2
		const container_2 = scene.add.container(0, 0);
		this.add(container_2);

		// upgradeSmallPanel
		const upgradeSmallPanel = new UpgradeObject(scene, -357, -15);
		this.add(upgradeSmallPanel);

		// upgradeSmallPanel_1
		const upgradeSmallPanel_1 = new UpgradeObject(scene, -186, -15);
		this.add(upgradeSmallPanel_1);

		// upgradeSmallPanel_2
		const upgradeSmallPanel_2 = new UpgradeObject(scene, -4, -15);
		this.add(upgradeSmallPanel_2);

		// upgradeSmallPanel_3
		const upgradeSmallPanel_3 = new UpgradeObject(scene, 159, -15);
		this.add(upgradeSmallPanel_3);

		// upgradeSmallPanel_4
		const upgradeSmallPanel_4 = new UpgradeObject(scene, 335, -15);
		this.add(upgradeSmallPanel_4);

		// rewardedBtn
		const rewardedBtn = scene.add.image(159, 178, "rewardedBtn");
		this.add(rewardedBtn);

		// closeBtn
		const closeBtn = scene.add.image(335, 178, "closeBtn");
		this.add(closeBtn);

		this.upgradeRainbow = upgradeRainbow;
		this.upgradeBg = upgradeBg;
		this.titleText = text_1;
		this.closeButton = closeBtn;
		this.closeButton.setInteractive({ useHandCursor: true });
		this.setVisible(false);
		this.setAlpha(0);

		/* START-USER-CTR-CODE */
		this.upgradeCards = [
			upgradeSmallPanel,
			upgradeSmallPanel_1,
			upgradeSmallPanel_2,
			upgradeSmallPanel_3,
			upgradeSmallPanel_4,
		];
		/* END-USER-CTR-CODE */
	}

	public readonly upgradeCards: UpgradeObject[];
	private upgradeRainbow: Phaser.GameObjects.Image;
	public upgradeBg: Phaser.GameObjects.Image;
	private titleText: Phaser.GameObjects.Text;
	public closeButton: Phaser.GameObjects.Image;

	/* START-USER-CODE */

	public setCloseHandler(onClose: () => void) {
		this.closeButton.removeAllListeners();
		this.closeButton.setInteractive({ useHandCursor: true });
		this.closeButton.on(Phaser.Input.Events.POINTER_OVER, () => {
			this.closeButton.setScale(1.06);
		});
		this.closeButton.on(Phaser.Input.Events.POINTER_OUT, () => {
			this.closeButton.setScale(1);
		});
		this.closeButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
			this.closeButton.setScale(0.96);
			onClose();
		});
	}

	public animateOpen() {
		this.upgradeRainbow.setScale(0);
		this.upgradeRainbow.setRotation(0);
		this.scene.tweens.add({
			targets: this.upgradeRainbow,
			scale: 1,
			duration: 220,
			ease: "Back.Out",
			onComplete: () => {
				this.scene.tweens.add({
					targets: this.upgradeRainbow,
					angle: { from: 0, to: 360 },
					duration: 5000,
					ease: "Linear",
					repeat: -1
				});
			},
		});
	}

	public animateClose() {
		this.scene.tweens.add({
			targets: this.upgradeRainbow,
			scale: 0,
			duration: 180,
			ease: "Back.In",
			onComplete: () => {
				this.upgradeRainbow.setRotation(0);
			},
		});
	}

	public populateChoices(
		choices: Array<{
			id: UnlockId;
			label: string;
			textureKey: string;
			frame?: string | number;
			cost: number;
			isAffordable: boolean;
		}>,
		onSelect: (unlockId: UnlockId) => void,
	) {
		this.upgradeCards.forEach((card, index) => {
			const choice = choices[index];
			card.setVisible(Boolean(choice));
			card.setScale(1);
			card.removeAllListeners();
			card.hitAreaPanel.removeAllListeners();
			card.hitAreaPanel.disableInteractive();

			if (!choice) {
				card.setAlpha(0);
				return;
			}

			const isAffordable = choice.isAffordable;
			card.setAlpha(isAffordable ? 1 : 0.45);

			if (choice.frame !== undefined) {
				card.itemImage.setTexture(choice.textureKey, choice.frame);
			} else {
				card.itemImage.setTexture(choice.textureKey);
			}
			card.text.setText(choice.label.toUpperCase());
			card.itemCost.setText(String(choice.cost));

			if (!isAffordable) {
				return;
			}

			card.hitAreaPanel.setInteractive({ useHandCursor: true });
			card.hitAreaPanel.on(Phaser.Input.Events.POINTER_OVER, () => {
				// Keep hit area fixed; only the card alpha/visual state changes.
			});
			card.hitAreaPanel.on(Phaser.Input.Events.POINTER_OUT, () => {
				// Keep hit area fixed; only the card alpha/visual state changes.
			});
			card.hitAreaPanel.on(Phaser.Input.Events.POINTER_DOWN, () => {
				onSelect(choice.id);
			});
		});

		this.titleText.setText(choices.length > 0 ? "SELECT NEW UPGRADE" : "New Unlock");
	}


	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
