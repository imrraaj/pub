(() => {
    const canvas = document.getElementById("glcanvas");
    if(!canvas) return;
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function getShaderSource(id) {
        return document.getElementById(id).textContent;
    }

    const vertexShaderSource = getShaderSource("vertex-shader");
    const fragmentShaderSource = getShaderSource("fragment-shader");

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(
                "An error occurred compiling the shaders:",
                gl.getShaderInfoLog(shader)
            );
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(
                "Unable to initialize the shader program:",
                gl.getProgramInfoLog(program)
            );
            return null;
        }
        return program;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
        gl,
        gl.FRAGMENT_SHADER,
        fragmentShaderSource
    );
    const program = createProgram(gl, vertexShader, fragmentShader);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let startTime = null;

    function render(time) {
        if (window.gl_animation) {
            if (!startTime) startTime = time; // Set the start time only once.

            const elapsedTime = (time - startTime) * 0.001; // Convert time to seconds.

            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            gl.uniform1f(timeLocation, elapsedTime); // Pass elapsed time to the shader.
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        } else {
            startTime = null;
        }
        requestAnimationFrame(render);
    }

    resize();
    function resize() {
        const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
        canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
        gl.viewport(0, 0, canvas.width, canvas.height);
        canvas.style.width = window.innerWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        document.documentElement.requestFullscreen();
    }

    window.addEventListener("resize", resize);

    requestAnimationFrame(render);
})();
