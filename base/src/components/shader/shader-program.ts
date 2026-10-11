const vertexSource = `
attribute vec2 position;
void main() {
	gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragmentSource = `
precision mediump float;
uniform vec2 resolution;
uniform float time;
uniform vec3 background;
uniform vec3 ink;
void main() {
	vec2 point = gl_FragCoord.xy / resolution;
	point.x *= resolution.x / resolution.y;
	vec2 drift = vec2(sin(time * 0.09), cos(time * 0.07)) * 0.16;
	float first = exp(-2.4 * length(point - vec2(0.3, 0.65) - drift));
	float second = exp(-3.0 * length(point - vec2(1.05, 0.2) + drift));
	float field = (first + second) * 0.045;
	gl_FragColor = vec4(mix(background, ink, field), 1.0);
}`;

export class ShaderProgram {
	private readonly shaders: WebGLShader[] = [];
	private readonly program: WebGLProgram;
	private buffer: WebGLBuffer | null = null;

	public constructor(private readonly gl: WebGLRenderingContext) {
		this.program = gl.createProgram();
	}

	private compile(kind: number, source: string): WebGLShader {
		const { gl } = this;
		const shader = gl.createShader(kind);
		if (shader === null) {
			throw new Error("Shader allocation failed");
		}
		this.shaders.push(shader);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) !== true) {
			throw new Error("Shader compilation failed");
		}
		return shader;
	}

	public initialize(): void {
		const { gl } = this;
		this.buffer = gl.createBuffer();
		gl.attachShader(this.program, this.compile(gl.VERTEX_SHADER, vertexSource));
		gl.attachShader(this.program, this.compile(gl.FRAGMENT_SHADER, fragmentSource));
		gl.linkProgram(this.program);
		if (gl.getProgramParameter(this.program, gl.LINK_STATUS) !== true) {
			throw new Error("Shader linking failed");
		}
		gl.useProgram(this.program);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		const position = gl.getAttribLocation(this.program, "position");
		gl.enableVertexAttribArray(position);
		gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
		if (gl.getError() !== gl.NO_ERROR) {
			throw new Error("Shader setup failed");
		}
	}

	public setColors(background: Float32Array, ink: Float32Array): void {
		const { gl } = this;
		gl.uniform3fv(gl.getUniformLocation(this.program, "background"), background);
		gl.uniform3fv(gl.getUniformLocation(this.program, "ink"), ink);
	}

	public draw(width: number, height: number, seconds: number): void {
		const { gl } = this;
		gl.viewport(0, 0, width, height);
		gl.uniform2f(gl.getUniformLocation(this.program, "resolution"), width, height);
		gl.uniform1f(gl.getUniformLocation(this.program, "time"), seconds);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}

	public dispose(): void {
		for (const shader of this.shaders) {
			this.gl.deleteShader(shader);
		}
		this.shaders.length = 0;
		this.gl.deleteBuffer(this.buffer);
		this.gl.deleteProgram(this.program);
		this.buffer = null;
	}
}
