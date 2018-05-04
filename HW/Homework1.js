"use strict";

var canvas;
var gl;
var numVertices = 36;
var numChecks = 8;
var program;
var flag = true;

//punto 1
var invert = false;

//conversione JS punto 2
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye = vec3(0.0, 0.0, 3.0);
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
//fine conversione JS

//punto 3
var scalingF = 1;
var XtranslationF = 0;
var YtranslationF = 0;
var ZtranslationF = 0;

//punto 4
var near = 0.3;
var far = 5.0;

//punto 5
var fovy = 45.0;
var aspect = 1.0;
var projection = 1;

//punto 6
var pointsArray = [];
var normalsArray = [];
//prima stava a 10.0, 10.0, 10.0, 0.0
var XLightF = 0.0;
var YLightF = 0.0;
var ZLightF = 5.0;
var lightPosition = vec4(XLightF, YLightF, ZLightF, 0.0);
var lightAmbient = vec4(0.3, 0.3, 0.3, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 0.8, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
//http://devernay.free.fr/cours/opengl/materials.html
//emerald
var materialAmbient = vec4(0.0215, 0.1745, 0.0215, 1.0);
var materialDiffuse = vec4(0.07568, 0.61424, 0.07568, 1.0);
var materialSpecular = vec4(0.633, 0.727811, 1.0, 0.633);
var materialShininess = 1.0;
// "NEUTRAL" MATERIAL (so you can see the colors of the lights)
/*var materialAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 100.0;*/
var ambientProduct, diffuseProduct, specularProduct;
//fine punto 6

//punto7
var button = true;
var varShader = 1;
var buttonLoc;

var vertices = [
	vec4(-0.5, -0.5, 0.5, 1.0),
	vec4(-0.5, 0.5, 0.5, 1.0),
	vec4(0.5, 0.5, 0.5, 1.0),
	vec4(0.5, -0.5, 0.5, 1.0),
	vec4(-0.5, -0.5, -0.5, 1.0),
	vec4(-0.5, 0.5, -0.5, 1.0),
	vec4(0.5, 0.5, -0.5, 1.0),
	vec4(0.5, -0.5, -0.5, 1.0)
];

/*var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];*/

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = xAxis;
var theta = [45.0, 45.0, 45.0];
var thetaLoc;

function quad(a, b, c, d) {
	/*pointsArray.push(vertices[a]);
	colorsArray.push(vertexColors[a]);

	pointsArray.push(vertices[b]);
	colorsArray.push(vertexColors[a]);

	pointsArray.push(vertices[c]);
	colorsArray.push(vertexColors[a]);

	pointsArray.push(vertices[a]);
	colorsArray.push(vertexColors[a]);

	pointsArray.push(vertices[c]);
	colorsArray.push(vertexColors[a]);

	pointsArray.push(vertices[d]);
	colorsArray.push(vertexColors[a]);*/

	var t1 = subtract(vertices[b], vertices[a]);
	var t2 = subtract(vertices[c], vertices[b]);
	var normal = cross(t1, t2);
	var normal = vec3(normal);
	normal = normalize(normal);


	pointsArray.push(vertices[a]);
	normalsArray.push(normal);
	pointsArray.push(vertices[b]);
	normalsArray.push(normal);
	pointsArray.push(vertices[c]);
	normalsArray.push(normal);
	pointsArray.push(vertices[a]);
	normalsArray.push(normal);
	pointsArray.push(vertices[c]);
	normalsArray.push(normal);
	pointsArray.push(vertices[d]);
	normalsArray.push(normal);
}

function colorCube() {
	quad(1, 0, 3, 2);
	quad(2, 3, 7, 6);
	quad(3, 0, 4, 7);
	quad(6, 5, 1, 2);
	quad(4, 5, 6, 7);
	quad(5, 4, 0, 1);
}


window.onload = function init() {

	canvas = document.getElementById("gl-canvas");

	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
		alert("WebGL isn't available");
	}

	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 0.0);

	gl.enable(gl.DEPTH_TEST);

	//
	//  Load shaders and initialize attribute buffers
	//
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	colorCube();

	/*var cBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

	var vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );*/

	//punto6
	//il flatten converte gli oggetti js (vec,mat 234) nel formato accettato da gl.bufferData
	var nBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

	var vNormal = gl.getAttribLocation(program, "vNormal");
	gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vNormal);
	//finepunto6

	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);


	//punto6
	ambientProduct = mult(lightAmbient, materialAmbient);
	diffuseProduct = mult(lightDiffuse, materialDiffuse);
	specularProduct = mult(lightSpecular, materialSpecular);


	//conversione JS punto2
	modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
	projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
	//fine conversione JS
	//punto7
	buttonLoc = gl.getUniformLocation(program, "button");
	

	thetaLoc = gl.getUniformLocation(program, "theta");



	document.getElementById("ButtonX").onclick = function () {
		axis = xAxis;
	};
	document.getElementById("ButtonY").onclick = function () {
		axis = yAxis;
	};
	document.getElementById("ButtonZ").onclick = function () {
		axis = zAxis;
	};
	document.getElementById("ButtonT").onclick = function () {
		flag = !flag;
	};
	//punto1
	document.getElementById("ButtonI").onclick = function () {
		invert = !invert;
	};
	//punto3
	document.getElementById("SliderS").oninput = function (event) {
		scalingF = parseFloat(event.target.value);
		document.getElementById("scaleBox").value = scalingF;
	};
	document.getElementById("SliderXT").oninput = function (event) {
		XtranslationF = parseFloat(event.target.value);
		document.getElementById("XtranslationBox").value = XtranslationF;
	};
	document.getElementById("SliderYT").oninput = function (event) {
		YtranslationF = parseFloat(event.target.value);
		document.getElementById("YtranslationBox").value = YtranslationF;
	};
	document.getElementById("SliderZT").oninput = function (event) {
		ZtranslationF = parseFloat(event.target.value);
		document.getElementById("ZtranslationBox").value = ZtranslationF;
	};
	document.getElementById("SliderN").oninput = function (event) {
		near = parseFloat(event.target.value);
		document.getElementById("nearBox").value = near;
	};
	document.getElementById("SliderF").oninput = function (event) {
		far = parseFloat(event.target.value);
		document.getElementById("farBox").value = far;
	};
	document.getElementById("ButtonP").onclick = function () {
		projection = !projection;
	};
	document.getElementById("ButtonS").oninput = function (event) {
		varShader = parseFloat(event.target.value);
		if (varShader > 0.0) {
			document.getElementById("shaderBox").value = "Phong";
			button = true;
		} else {
			document.getElementById("shaderBox").value = "Gouraud"
			button = false;
		}
	};
	document.getElementById("SliderXL").oninput = function (event) {
		XLightF = parseFloat(event.target.value);
		document.getElementById("XLightBox").value = XLightF;
	};
	document.getElementById("SliderYL").oninput = function (event) {
		YLightF = parseFloat(event.target.value);
		document.getElementById("YLightBox").value = YLightF;
	};
	document.getElementById("SliderZL").oninput = function (event) {
		ZLightF = parseFloat(event.target.value);
		document.getElementById("ZLightBox").value = ZLightF;
	};
	
	//punto6
	gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
	gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
	//punto 7
	gl.uniform4fv(gl.getUniformLocation(program, "AmbientProduct"), flatten(ambientProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "DiffuseProduct"), flatten(diffuseProduct));
	gl.uniform4fv(gl.getUniformLocation(program, "SpecularProduct"), flatten(specularProduct));
	gl.uniform1f(gl.getUniformLocation(program, "Shininess"), materialShininess);
	

	render();

}

var render = function () {
	
	// il buffer è il luogo dove sono contenuti gli array di pixel.
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	//rotation
	if (flag) invert ? theta[axis] -= 1.0 : theta[axis] += 1.0;

	//rendering the matrices

	//punto 2
	/*var c=[];
	var s=[];
	for(var i = 0; i < 3; i++){
	    c[i] = Math.cos(theta[i] * Math.PI / 180);
	    s[i] = Math.sin(theta[i] * Math.PI / 180);
	}
	//fine punto 2

	/*var rx = [
	    1.0,  0.0,  0.0, 0.0,
	    0.0,  c[xAxis],   s[xAxis],  0.0,
	    0.0, -s[xAxis],   c[xAxis],  0.0,
	    0.0,  0.0,  0.0, 1.0
	];
	var ry = [
	    c[yAxis],   0.0,  -s[yAxis], 0.0,
	    0.0,  1.0,  0.0, 0.0,
	    s[yAxis],   0.0,  c[yAxis],  0.0,
	    0.0,  0.0,  0.0, 1.0
	];
	var rz = [
	    c[zAxis],   s[zAxis],   0.0, 0.0,
	   -s[zAxis],   c[zAxis],   0.0, 0.0,
	    0.0,  0.0,  1.0, 0.0,
	    0.0,  0.0,  0.0, 1.0
	];
	//punto 3
	var tM = [
	    scalingF, 0, 0, 0,
	    0, scalingF, 0, 0,
	    0, 0, scalingF, 0,
	    XtranslationF, YtranslationF, ZtranslationF, 1,
	];

	var rx_loc = gl.getUniformLocation(program, "rx");
	gl.uniformMatrix4fv(rx_loc, false, rx);
	var ry_loc = gl.getUniformLocation(program, "ry");
	gl.uniformMatrix4fv(ry_loc, false, ry);
	var rz_loc = gl.getUniformLocation(program, "rz");
	gl.uniformMatrix4fv(rz_loc, false, rz);

	//punto3
	/*var scalingLoc = gl.getUniformLocation(program, "scalingF");
	gl.uniform1f( scalingLoc, false, scalingF);
	var XtranslationLoc = gl.getUniformLocation(program, "XtranslationF");
	gl.uniform1f( XtranslationLoc, false, XtranslationF);
	var YtranslationLoc = gl.getUniformLocation(program, "YtranslationF");
	gl.uniform1f( YtranslationLoc, false, YtranslationF);
	var ZtranslationLoc = gl.getUniformLocation(program, "ZtranslationF");
	gl.uniform1f( ZtranslationLoc, false, ZtranslationF);

	/*var neaLoc = gl.getUniformLocation(program, "near");
	gl.uniform1f( neaLoc, false, near);
	var farLoc = gl.getUniformLocation(program, "far");
	gl.uniform1f( farLoc, false, far);*/

	/*var tMLoc = gl.getUniformLocation(program, 'tM');
	gl.uniformMatrix4fv(tMLoc, false, tM);*/
	
	gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(vec4(XLightF, YLightF, ZLightF, 0.0)));
	
	
	gl.uniform3fv(thetaLoc, theta);	
	

	//conversioneJS
	modelViewMatrix = lookAt(eye, at, up);
	//punto 3
	modelViewMatrix = mult(modelViewMatrix, scalem(scalingF, scalingF, scalingF));
	modelViewMatrix = mult(modelViewMatrix, translate(XtranslationF, YtranslationF, ZtranslationF));
	//punto 2
	modelViewMatrix = mult(modelViewMatrix, rotate(theta[xAxis], [1, 0, 0]));
	modelViewMatrix = mult(modelViewMatrix, rotate(theta[yAxis], [0, 1, 0]));
	modelViewMatrix = mult(modelViewMatrix, rotate(theta[zAxis], [0, 0, 1]));

	//punto 4 e 5
	projection ? projectionMatrix = ortho(-1, 1, -1, 1, near, far) : projectionMatrix = perspective(fovy, aspect, near, far);
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
	gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
	//fine conversione JS
	
	//punto7
	gl.uniform1f(buttonLoc, button);
	
	//triangoli sono l'unica forma che webgl permette
	gl.drawArrays(gl.TRIANGLES, 0, numVertices);

	requestAnimFrame(render);

	//how to see the values for theta and flag
	$(document).ready(function () {
		$('#textbox_id').val(theta[axis]);
	});

	$(document).ready(function () {
		$('#textbox_id2').val(flag);
	});
}
