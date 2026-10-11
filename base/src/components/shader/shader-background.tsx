import { ShaderRenderer } from "./shader-renderer";

function connectCanvas(canvas: HTMLCanvasElement | null): (() => void) | undefined {
	if (canvas === null) {
		return undefined;
	}
	const gl = canvas.getContext("webgl", {
		alpha: false,
		antialias: false,
		depth: false,
		stencil: false,
		powerPreference: "low-power",
	});
	if (gl === null) {
		return undefined;
	}
	let renderer: ShaderRenderer | null = null;
	try {
		renderer = new ShaderRenderer(canvas, gl);
		renderer.start();
		return renderer.dispose;
	} catch {
		renderer?.dispose();
		canvas.setAttribute("hidden", "");
		return undefined;
	}
}

export function ShaderBackground() {
	return <canvas aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" ref={connectCanvas} />;
}
