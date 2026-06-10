export const DEVELOPER_CHEAT_CODE = "makemoney";
export const DEVELOPER_CHEAT_COINS = 999;

export function bindDeveloperCheatCode(
	scene: Phaser.Scene,
	onMatch: () => void,
	code = DEVELOPER_CHEAT_CODE,
): () => void {
	let buffer = "";
	const keyboard = scene.input.keyboard;

	if (!keyboard) {
		return () => undefined;
	}

	const handleKeyDown = (event: KeyboardEvent) => {
		const key = event.key.toLowerCase();

		if (key.length !== 1 || key < "a" || key > "z") {
			return;
		}

		buffer = `${buffer}${key}`.slice(-code.length);

		if (buffer === code) {
			buffer = "";
			onMatch();
		}
	};

	keyboard.on("keydown", handleKeyDown);

	return () => {
		keyboard.off("keydown", handleKeyDown);
	};
}