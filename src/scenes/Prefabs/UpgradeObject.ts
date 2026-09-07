
// You can write more code here

/* START OF COMPILED CODE */

/* START-USER-IMPORTS */
/* END-USER-IMPORTS */

export default class UpgradeObject extends Phaser.GameObjects.Container {

	constructor(scene: Phaser.Scene, x?: number, y?: number) {
		super(scene, x ?? 0, y ?? 0);

		// upgradeSmallPanel
		const upgradeSmallPanel = scene.add.image(0, 0, "upgradeSmallPanel");
		this.add(upgradeSmallPanel);

		// upgradeCostPanel
		const upgradeCostPanel = scene.add.image(0, 103, "upgradeCostPanel");
		this.add(upgradeCostPanel);

		// itemImage
		const itemImage = scene.add.image(0, 0, "Product2Cooked");
		this.add(itemImage);

		// text
		const text = scene.add.text(0, -94, "", {});
		text.setOrigin(0.5, 0.5);
		text.text = "ProductText";
		text.setStyle({ "color": "#DF3D7A", "fontFamily": "Klop", "fontSize": "15pt" });
		this.add(text);

		// ItemCost
		const itemCost = scene.add.text(-18, 102, "", {});
		itemCost.setOrigin(0, 0.5);
		itemCost.text = "0000";
		itemCost.setStyle({ "color": "#FFE769", "fontFamily": "Klop", "fontSize": "15pt", "stroke": "#FEB134", "strokeThickness": 2 });
		this.add(itemCost);

		// coin
		const coin = scene.add.image(-38, 103, "coin");
		coin.scaleX = 0.601251851079237;
		coin.scaleY = 0.601251851079237;
		this.add(coin);

		// HitAreaPanel
		const hitAreaPanel = scene.add.rectangle(0, 0, 150, 182, 0xffffff, 0);
		hitAreaPanel.setOrigin(0.5, 0.5);
		this.add(hitAreaPanel);

		this.itemImage = itemImage;
		this.text = text;
		this.itemCost = itemCost;
		this.hitAreaPanel = hitAreaPanel;

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	public itemImage: Phaser.GameObjects.Image;
	public text: Phaser.GameObjects.Text;
	public itemCost: Phaser.GameObjects.Text;
	public hitAreaPanel: Phaser.GameObjects.Rectangle;

	/* START-USER-CODE */

	// Write your code here.

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
