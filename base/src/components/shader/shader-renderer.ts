import { ShaderProgram } from "./shader-program";

export class ShaderRenderer {
	private readonly program: ShaderProgram;
	private readonly reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
	private readonly themeObserver = new MutationObserver(() => this.refreshColors());
	private readonly resizeObserver = new ResizeObserver(() => this.resize());
	private readonly colorContext = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
	private frame = 0;
	private elapsed = 0;
	private previousTime = 0;

	private readonly animate = (timestamp: number): void => {
		if (this.previousTime !== 0) {
			this.elapsed += (timestamp - this.previousTime) / 1000;
		}
		this.previousTime = timestamp;
		this.draw();
		this.frame = requestAnimationFrame(this.animate);
	};

	private readonly refreshMotion = (): void => {
		cancelAnimationFrame(this.frame);
		this.previousTime = 0;
		this.draw();
		if (document.hidden || this.reducedMotion.matches) {
			return;
		}
		this.frame = requestAnimationFrame(this.animate);
	};

	private readonly handleContextLoss = (): void => {
		this.canvas.style.visibility = "hidden";
		this.dispose();
	};

	public readonly dispose = (): void => {
		cancelAnimationFrame(this.frame);
		this.resizeObserver.disconnect();
		this.themeObserver.disconnect();
		this.reducedMotion.removeEventListener("change", this.refreshMotion);
		document.removeEventListener("visibilitychange", this.refreshMotion);
		this.canvas.removeEventListener("webglcontextlost", this.handleContextLoss);
		this.program.dispose();
	};

	public constructor(private readonly canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
		this.program = new ShaderProgram(gl);
	}

	private refreshColors(): void {
		this.program.setColors(this.readColor("--background"), this.readColor("--muted-foreground"));
		this.draw();
	}

	private readColor(token: string): Float32Array {
		const context = this.colorContext;
		if (context === null) {
			throw new Error("Shader color conversion unavailable");
		}
		context.clearRect(0, 0, 1, 1);
		context.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(token);
		context.fillRect(0, 0, 1, 1);
		const { data } = context.getImageData(0, 0, 1, 1);
		return new Float32Array(Array.from(data.subarray(0, 3), (channel) => channel / 255));
	}

	private resize(): void {
		const scale = Math.min(devicePixelRatio, 1.5);
		this.canvas.width = Math.max(1, Math.round(this.canvas.clientWidth * scale));
		this.canvas.height = Math.max(1, Math.round(this.canvas.clientHeight * scale));
		this.draw();
	}

	private draw(): void {
		this.program.draw(this.canvas.width, this.canvas.height, this.elapsed);
	}

	public start(): void {
		this.program.initialize();
		this.refreshColors();
		this.resizeObserver.observe(this.canvas);
		this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
		this.reducedMotion.addEventListener("change", this.refreshMotion);
		document.addEventListener("visibilitychange", this.refreshMotion);
		this.canvas.addEventListener("webglcontextlost", this.handleContextLoss);
		this.resize();
		this.refreshMotion();
	}
}
