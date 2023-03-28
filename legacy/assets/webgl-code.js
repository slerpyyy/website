var canvas, gl;
var mouseX, mouseY, targetX, targetY;
var posAttribute, timeUniform, aspectUniform, mouseUniform;
var prog, rect;
var startTime, currTime, time, aspect;

document.onmousemove = updateMouse
function updateMouse(event)
{
	var eventDoc, doc, body;

	event = event || window.event;

	if (event.pageX == null && event.clientX != null) {
		eventDoc = (event.target && event.target.ownerDocument) || document;
		doc = eventDoc.documentElement;
		body = eventDoc.body;

		event.pageX = event.clientX +
			(doc && doc.scrollLeft || body && body.scrollLeft || 0) -
			(doc && doc.clientLeft || body && body.clientLeft || 0);
		event.pageY = event.clientY +
			(doc && doc.scrollTop  || body && body.scrollTop  || 0) -
			(doc && doc.clientTop  || body && body.clientTop  || 0 );
	}

	if (canvas != null && canvas.clientWidth != null) {
		targetX = (canvas.clientWidth - event.pageX) / canvas.clientWidth;
		targetY = event.pageY / canvas.clientHeight;
	} else {
		targetX = 0.5;
		targetY = 0.5;
	}
}

function getShader(id, type) {
	var shader = gl.createShader(type);

	var shaderScript = document.getElementById(id);
	gl.shaderSource(shader, shaderScript.innerText);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.debug(shaderScript.innerText);
		console.debug(gl.getShaderInfoLog(shader));
	}

	return shader;
}

function setupShaders() {
	var vsh = getShader("vsh", gl.VERTEX_SHADER);
	var fsh = getShader("fsh", gl.FRAGMENT_SHADER);

	prog = gl.createProgram();
	gl.attachShader(prog, vsh);
	gl.attachShader(prog, fsh);
	gl.linkProgram(prog);

	if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
		console.debug("Cannot link program");

	gl.useProgram(prog);

	posAttribute = gl.getAttribLocation(prog, "pos");
	gl.enableVertexAttribArray(posAttribute);

	timeUniform = gl.getUniformLocation(prog, "time");
	aspectUniform = gl.getUniformLocation(prog, "aspect");
	mouseUniform = gl.getUniformLocation(prog, "mouse");

	rect = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, rect);

	var verts = [-1,-1,0,-1,1,0,1,-1,0,1,-1,0,1,1,0,-1,1,0];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

	targetX = (mouseX = 0.5);
	targetY = (mouseY = 0.5);
}

function draw() {
	requestAnimationFrame(draw);

	currTime = (new Date()).getTime()
	time = (currTime - startTime) / 1000.0;
	aspect = canvas.clientWidth / canvas.clientHeight;

	gl.uniform1f(timeUniform, time);
	gl.uniform1f(aspectUniform, aspect);
	gl.uniform2f(mouseUniform, mouseX, mouseY);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.bindBuffer(gl.ARRAY_BUFFER, rect);
	gl.vertexAttribPointer(posAttribute, 3, gl.FLOAT, false, 3*4, 0);
	gl.drawArrays(gl.TRIANGLES, 0, 6);

	mouseX = (7 * mouseX + targetX) / 8;
	mouseY = (7 * mouseY + targetY) / 8;
}

function setupWebGL() {
	canvas = document.getElementById("bg-live");

	canvas.width  = canvas.clientWidth  / 5;
	canvas.height = canvas.clientHeight / 5;

	try { gl = canvas.getContext("webgl"); } catch (e) {}
	if (!gl) console.debug("Cannot initialize WebGL");

	setupShaders();

	startTime = (new Date()).getTime();

	requestAnimationFrame(draw);
}
