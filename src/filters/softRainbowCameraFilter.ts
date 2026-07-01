import Phaser from "phaser";

const FILTER_NODE_NAME = "FilterSoftRainbow";

const SOFT_RAINBOW_FRAGMENT_SHADER = `
#pragma phaserTemplate(shaderName)
precision mediump float;
uniform sampler2D uMainSampler;
uniform float uTime;
uniform float uStrength;
varying vec2 outTexCoord;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec4 color = texture2D(uMainSampler, outTexCoord);
    float hue = fract(outTexCoord.x * 0.7 + outTexCoord.y * 0.5 + uTime);
    vec3 rainbow = hsv2rgb(vec3(hue, 0.3, 1.0));
    vec3 tinted = color.rgb * mix(vec3(1.0), rainbow, uStrength);
    gl_FragColor = vec4(tinted, color.a);
}
`;

export interface SoftRainbowCameraFilterOptions {
	strength?: number;
	speed?: number;
}

class SoftRainbowController extends Phaser.Filters.Controller {
	time = 0;
	strength: number;

	constructor(camera: Phaser.Cameras.Scene2D.Camera, strength: number) {
		super(camera, FILTER_NODE_NAME);
		this.strength = strength;
	}
}

class FilterSoftRainbow extends Phaser.Renderer.WebGL.RenderNodes.BaseFilterShader {
	constructor(manager: Phaser.Renderer.WebGL.RenderNodes.RenderNodeManager) {
		super(FILTER_NODE_NAME, manager, undefined, SOFT_RAINBOW_FRAGMENT_SHADER);
	}

	setupUniforms(
		controller: Phaser.Filters.Controller,
		_drawingContext: Phaser.Renderer.WebGL.DrawingContext,
	): void {
		const softController = controller as SoftRainbowController;

		this.programManager.setUniform("uTime", softController.time);
		this.programManager.setUniform("uStrength", softController.strength);
	}
}

function registerSoftRainbowFilterNode(scene: Phaser.Scene) {
	const renderer = scene.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
	const renderNodes = renderer.renderNodes;

	if (renderNodes.hasNode(FILTER_NODE_NAME)) {
		return;
	}

	renderNodes.addNodeConstructor(FILTER_NODE_NAME, FilterSoftRainbow);
}

function isWebGLRenderer(scene: Phaser.Scene): scene is Phaser.Scene & {
	renderer: Phaser.Renderer.WebGL.WebGLRenderer;
} {
	return scene.game.renderer.type === Phaser.WEBGL;
}

export function applySoftRainbowCameraFilter(
	scene: Phaser.Scene,
	options: SoftRainbowCameraFilterOptions = {},
): SoftRainbowController | null {
	if (!isWebGLRenderer(scene)) {
		return null;
	}

	registerSoftRainbowFilterNode(scene);

	const strength = options.strength ?? 0.14;
	const speed = options.speed ?? 0.04;
	const camera = scene.cameras.main;
	const controller = new SoftRainbowController(camera, strength);

	camera.filters.external.add(controller);

	const updateHandler = (_time: number, delta: number) => {
		controller.time += delta * 0.001 * speed;
	};

	scene.events.on("update", updateHandler);
	scene.events.once("shutdown", () => {
		scene.events.off("update", updateHandler);
	});

	return controller;
}