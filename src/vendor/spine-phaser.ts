import { SpineGameObject as SpineGameObjectV4 } from "@esotericsoftware/spine-phaser-v4";

export * from "@esotericsoftware/spine-phaser-v4";

export class SpineGameObject extends SpineGameObjectV4 {
	declare skeleton: any;
}