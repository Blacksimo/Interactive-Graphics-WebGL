"use strict";

var canvas;
var gl;
var program;
var m = mat4();

var projectionMatrix;
var modelViewMatrix;
var modelViewMatrixLoc;
var instanceMatrix;

var bodyId = 0;
var headId = 1;
var head1Id = 1;
var head2Id = 10;
var upperFrontLeftId = 2;
var lowerFrontLeftId = 3;
var upperFrontRightId = 4;
var lowerFrontRightId = 5;
var upperRearLeftId = 6;
var lowerRearLeftId = 7;
var upperRearRightId = 8;
var lowerRearRightId = 9;
var tailId = 11;

var headHeight = 1.0;
var headWidth = 1.3;
var bodyWidth = 2.0;
var bodyHeight = 4.0;
var legHeight = 1.25;
var legWidth = 0.5;
var tailHeight = 1.0;
var tailWidth = 0.5;

var numNodes = 11;

var theta = [0, 0, 185, -25, 185, -25, 185, -25, 185, -25, 0, 45];
var numVertices = 24;
var stack = [];

var figure = [];
for (var i = 0; i <= numNodes; i++) figure[i] = createNode(null, null, null, null);

var vBuffer;
var modelviewLoc;

//punto2
var texSize = 256;
var numChecks = 4;
var texture1, texture2;
var t1, t2;
var c;
var image1 = new Uint8Array(4 * texSize * texSize);
for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        var patchx = Math.floor(i / (texSize / numChecks));
        var patchy = Math.floor(j / (texSize / numChecks));
        if (patchx % 2 ^ patchy % 2) c = 255;
        else c = 0;
        //c = 255*(((i & 0x8) == 0) ^ ((j & 0x8)  == 0))
        image1[4 * i * texSize + 4 * j] = c;
        image1[4 * i * texSize + 4 * j + 1] = c;
        image1[4 * i * texSize + 4 * j + 2] = c;
        image1[4 * i * texSize + 4 * j + 3] = 255;
    }
}
var image2 = new Uint8Array(4 * texSize * texSize);
// Create a linear checkerboard pattern
for (var i = 0; i < texSize; i++) {
    for (var j = 0; j < texSize; j++) {
        //var c = 127 + 127 * Math.sin(0.1*i*j);
        image2[4 * i * texSize + 4 * j] = j;
        image2[4 * i * texSize + 4 * j + 1] = j;
        image2[4 * i * texSize + 4 * j + 2] = j;
        image2[4 * i * texSize + 4 * j + 3] = 255;
    }
}
var pointsArray = [];
var colorsArray = [];
var texCoordsArray = [];
var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var vertexColors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),  // white
    vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];

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

//punto3
var sequence = 0;
var speed = 10;
var animation = false;
var breakInterval;
var walk_front = 0.0;
var walk_back = 0.0;
var comeBack = false;
var position = 0;

// ----------------------------------------------------------
// ------------------fine variabili--------------------------
// ----------------------------------------------------------

function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
}

function createNode(transform, render, sibling, child) {
    var node = {
        transform: transform,
        render: render,
        sibling: sibling,
        child: child,
    }
    return node;
}

//punto2
function configureTexture() {
    texture1 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image1);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    texture2 = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image2);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

function initNodes(Id) {
    switch (Id) {

        case bodyId:
            m = translate(0.0, 0.0, 0.0);
            m = mult(m, rotate(theta[bodyId], 0, 1, 0));
            figure[bodyId] = createNode(m, body, null, headId);
            break;

        case headId:
        case head1Id:
        case head2Id:
            m = translate(bodyHeight * 0.5 + headWidth * 0.5, 0.9 * bodyWidth - 0.5 * headHeight, 0.0);
            m = mult(m, rotate(theta[head1Id], 1, 0, 0));
            m = mult(m, rotate(theta[head2Id], 0, 1, 0));
            figure[headId] = createNode(m, head, upperFrontLeftId, null);
            break;

        case upperFrontLeftId:
            m = translate(0.5 * bodyHeight - 0.5 * legWidth, 0.3, -(bodyHeight / 2.0) + 0.5 * legWidth);
            m = mult(m, rotate(theta[upperFrontLeftId], 0, 0, 1));
            figure[upperFrontLeftId] = createNode(m, upperFLL, upperFrontRightId, lowerFrontLeftId);
            break;

        case upperFrontRightId:
            m = translate(0.5 * bodyHeight - 0.5 * legWidth, 0.3, (bodyHeight / 2.0) - 0.5 * legWidth);
            m = mult(m, rotate(theta[upperFrontRightId], 0, 0, 1));
            figure[upperFrontRightId] = createNode(m, upperFRL, upperRearLeftId, lowerFrontRightId);
            break;

        case upperRearLeftId:
            m = translate(-(0.5 * bodyHeight) + 0.5 * legWidth, 0.3, -(bodyHeight / 2.0) + 0.5 * legWidth);
            m = mult(m, rotate(theta[upperRearLeftId], 0, 0, 1));
            figure[upperRearLeftId] = createNode(m, upperRLL, upperRearRightId, lowerRearLeftId);
            break;

        case upperRearRightId:
            m = translate(-(0.5 * bodyHeight) + 0.5 * legWidth, 0.3, (bodyHeight / 2.0) - 0.5 * legWidth);
            m = mult(m, rotate(theta[upperRearRightId], 0, 0, 1));
            figure[upperRearRightId] = createNode(m, upperRRL, tailId, lowerRearRightId);
            break;

        case lowerFrontLeftId:

            m = translate(0.0, legHeight - 0.1, 0.0);
            m = mult(m, rotate(theta[lowerFrontLeftId], 0, 0, 1));
            figure[lowerFrontLeftId] = createNode(m, lowerFLL, null, null);
            break;

        case lowerFrontRightId:
            m = translate(0.0, legHeight - 0.1, 0.0);
            m = mult(m, rotate(theta[lowerFrontRightId], 0, 0, 1));
            figure[lowerFrontRightId] = createNode(m, lowerFRL, null, null);
            break;

        case lowerRearLeftId:
            m = translate(0.0, legHeight - 0.1, 0.0);
            m = mult(m, rotate(theta[lowerRearLeftId], 0, 0, 1));
            figure[lowerRearLeftId] = createNode(m, lowerRLL, null, null);
            break;

        case lowerRearRightId:
            m = translate(0.0, legHeight - 0.1, 0.0);
            m = mult(m, rotate(theta[lowerRearRightId], 0, 0, 1));
            figure[lowerRearRightId] = createNode(m, lowerRRL, null, null);
            break;

        case tailId:
            m = translate(-(0.45 * bodyHeight), bodyWidth * 0.8, 0.0);
            m = mult(m, rotate(theta[tailId], 0, 0, 1));
            figure[tailId] = createNode(m, tail, null, null);
            break;
    }
}

function traverse(Id) {

    if (Id == null) return;
    stack.push(modelViewMatrix);
    modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
    figure[Id].render();
    if (figure[Id].child != null) traverse(figure[Id].child);
    modelViewMatrix = stack.pop();
    if (figure[Id].sibling != null) traverse(figure[Id].sibling);
}

function body() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * bodyWidth, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(bodyHeight, 0.75 * bodyWidth, bodyHeight));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function head() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * headHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(headWidth, headHeight, headWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function upperFLL() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * legHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(legWidth, legHeight, legWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function lowerFLL() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * legHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(legWidth, legHeight, legWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function upperFRL() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * legHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(legWidth, legHeight, legWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function lowerFRL() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * legHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(legWidth, legHeight, legWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function upperRLL() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * legHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(legWidth, legHeight, legWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function lowerRLL() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * legHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(legWidth, legHeight, legWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function upperRRL() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * legHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(legWidth, legHeight, legWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function lowerRRL() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * legHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(legWidth, legHeight, legWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function tail() {

    instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * tailHeight, 0.0));
    instanceMatrix = mult(instanceMatrix, scale4(tailWidth, tailHeight, tailWidth));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
    for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function quad(a, b, c, d) {

    pointsArray.push(vertices[a]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(vertices[b]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(texCoord[1]);

    pointsArray.push(vertices[c]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(texCoord[2]);

    pointsArray.push(vertices[d]);
    colorsArray.push(vertexColors[a]);
    texCoordsArray.push(texCoord[3]);
}

function cube() {
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
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    instanceMatrix = mat4();

    projectionMatrix = ortho(-10.0, 10.0, -10.0, 10.0, -10.0, 10.0);
    modelViewMatrix = mat4();

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")
    cube();

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //punto3
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    configureTexture();

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.uniform1i(gl.getUniformLocation(program, "Tex0"), 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.uniform1i(gl.getUniformLocation(program, "Tex1"), 1);

    //fine punto3

    document.getElementById("slider0").onchange = function (event) {
        theta[bodyId] = event.target.value;
        initNodes(bodyId);
    };

    document.getElementById("walk").onclick = function () {
        animation = !animation;
    }
    for (i = 0; i <= numNodes; i++) initNodes(i);
    render();
}


var render = function () {
    requestAnimFrame(render);
    gl.clear(gl.COLOR_BUFFER_BIT);
    traverse(bodyId);
    if (animation) {
        setTimeout(function () {
            if (theta[upperFrontLeftId] > 160 && sequence == 0) {
                /* if (theta[lowerFrontLeftId] < 0) {
                    theta[lowerFrontLeftId]++;
                    initNodes(lowerFrontLeftId);
                    theta[lowerFrontRightId]++;
                    initNodes(lowerFrontRightId);
                    theta[lowerRearRightId]++;
                    initNodes(lowerRearRightId);
                    theta[lowerRearLeftId]++;
                    initNodes(lowerRearLeftId);
                }
                else {
                    theta[lowerFrontLeftId]--;
                    initNodes(lowerFrontLeftId);
                    theta[lowerFrontRightId]--;
                    initNodes(lowerFrontRightId);
                    theta[lowerRearRightId]--;
                    initNodes(lowerRearRightId);
                    theta[lowerRearLeftId]--;
                    initNodes(lowerRearLeftId);
                } */
                theta[upperFrontLeftId] -= 1;
                initNodes(upperFrontLeftId);
                theta[upperRearLeftId] -= 1;
                initNodes(upperRearLeftId);
                theta[upperFrontRightId] += 1;
                initNodes(upperFrontRightId);
                theta[upperRearRightId] += 1;
                initNodes(upperRearRightId);
                theta[tailId] -= 1;
                initNodes(tailId);
                if (theta[upperFrontLeftId] == 160) {
                    sequence = 1;
                }
            }
            if (theta[upperFrontLeftId] <= 185 && sequence == 1) {
                /* if (theta[lowerFrontLeftId] < 0) {
                    theta[lowerFrontLeftId]++;
                    initNodes(lowerFrontLeftId);
                    theta[lowerFrontRightId]++;
                    initNodes(lowerFrontRightId);
                    theta[lowerRearRightId]++;
                    initNodes(lowerRearRightId);
                    theta[lowerRearLeftId]++;
                    initNodes(lowerRearLeftId);
                }
                else {
                    theta[lowerFrontLeftId]--;
                    initNodes(lowerFrontLeftId);
                    theta[lowerFrontRightId]--;
                    initNodes(lowerFrontRightId);
                    theta[lowerRearRightId]--;
                    initNodes(lowerRearRightId);
                    theta[lowerRearLeftId]--;
                    initNodes(lowerRearLeftId);
                }*/
                theta[upperFrontLeftId] += 1;
                initNodes(upperFrontLeftId);
                theta[upperRearLeftId] += 1;
                initNodes(upperRearLeftId);
                theta[upperFrontRightId] -= 1;
                initNodes(upperFrontRightId);
                theta[upperRearRightId] -= 1;
                initNodes(upperRearRightId);
                theta[tailId] += 1;
                initNodes(tailId);
                if (theta[upperFrontLeftId] == 185) {
                    sequence = 0;
                }
            }
            if (comeBack == false) {
                if (theta[head2Id] != 90) {
                    theta[head2Id]++;
                    initNodes(head2Id);
                }
                walk_front += 0.01;
                m = translate(walk_front + position, 0.0, 0.0);
                if (position + walk_front >= 20) {
                    comeBack = true;
                    position = 20;
                    walk_front = 0.0;
                }
            } else {
                if (theta[head2Id] != -90) {
                    theta[head2Id]--;
                    initNodes(head2Id);
                }
                walk_back += 0.01;
                m = translate(position - walk_back, 0.0, 0.0);
                m = mult(m, rotate(180, 0, 1, 0));
                if (position - walk_back <= - 20) {
                    comeBack = false;
                    position = - 20;
                    walk_back = 0.0;
                }
            }
            figure[bodyId] = createNode(m, body, null, headId);

        }, 100);
    } else {
        setTimeout(function () {
            if (theta[upperFrontLeftId] != 185 && !comeBack) {
                theta[upperFrontLeftId] += 1;
                initNodes(upperFrontLeftId);
                theta[upperRearLeftId] += 1;
                initNodes(upperRearLeftId);
                theta[upperFrontRightId] -= 1;
                initNodes(upperFrontRightId);
                theta[upperRearRightId] -= 1;
                initNodes(upperRearRightId);
                theta[tailId] += 1;
                initNodes(tailId);
                sequence = 0;
            } else if (theta[upperFrontLeftId] != 185 && comeBack) {
                theta[upperFrontLeftId] -= 1;
                initNodes(upperFrontLeftId);
                theta[upperRearLeftId] -= 1;
                initNodes(upperRearLeftId);
                theta[upperFrontRightId] += 1;
                initNodes(upperFrontRightId);
                theta[upperRearRightId] += 1;
                initNodes(upperRearRightId);
                theta[tailId] -= 1;
                initNodes(tailId);
                sequence = 0;
            }
            if (theta[head2Id] != 0 && !comeBack) {
                theta[head2Id]--;
                initNodes(head2Id);
            } else if (theta[head2Id] != 0 && comeBack) {
                theta[head2Id]++;
                initNodes(head2Id);
            }
        }, 100);
    }

}
