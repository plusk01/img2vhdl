var RED_COLOR_DEPTH = 8;
var GREEN_COLOR_DEPTH = 8;
var BLUE_COLOR_DEPTH = 4;
var RED_STEP = Math.round(256 / (RED_COLOR_DEPTH-1));
var GREEN_STEP = Math.round(256 / (GREEN_COLOR_DEPTH-1));
var BLUE_STEP = Math.round(256 / (BLUE_COLOR_DEPTH-1));

var constrain = function(a, b) { return (a > b) ? b : a; }

var colorMapR = {}, colorMapG = {}, colorMapB = {};
for (var i=0; i<RED_COLOR_DEPTH; i++) {
    var color = constrain(i*RED_STEP, 255);
    var bits = ('0' + '0' + i.toString(2));
    colorMapR[color] = bits.substr(bits.length - 3);
}
for (var i=0; i<GREEN_COLOR_DEPTH; i++) {
    var color = constrain(i*GREEN_STEP, 255);
    var bits = ('0' + '0' + i.toString(2));
    colorMapG[color] = bits.substr(bits.length - 3);
}
for (var i=0; i<BLUE_COLOR_DEPTH; i++) {
    var color = constrain(i*BLUE_STEP, 255);
    var bits = ('0'  + i.toString(2));
    colorMapB[color] = bits.substr(bits.length - 2);
}

var canvas = document.createElement('canvas');
document.getElementsByTagName('body')[0].appendChild(canvas);
var ctx = canvas.getContext("2d");
var pixels = [];
var colors = {};

var WIDTH = 640; var HEIGHT=480;

canvas.width=WIDTH;
canvas.height=HEIGHT;

ctx.fillStyle = "#000";
ctx.fillRect(0,0,WIDTH,HEIGHT);

var getThemPixels = function() {
    
    var imgData = ctx.getImageData(0,0,WIDTH,HEIGHT);
    var pix = imgData.data;
    var pixelCount = 0;

    for (var i=0; i < pix.length; i += 4) {
        var row = Math.floor(pixelCount / WIDTH);
        var col = i % HEIGHT;
        
        var redCorrect = constrain(Math.round(pix[i]/RED_STEP)*RED_STEP, 255);
        var greenCorrect = constrain(Math.round(pix[i+1]/GREEN_STEP)*GREEN_STEP, 255);
        var blueCorrect = constrain(Math.round(pix[i+2]/BLUE_STEP)*BLUE_STEP, 255);


            
        var pixel = {
            'R': redCorrect,
            'G': greenCorrect,
            'B': blueCorrect
        }
        if (pixels[row] === undefined) pixels[row] = [];

        pixels[row].push(pixel);
        
        pix[i] = redCorrect;
        pix[i+1] = greenCorrect;
        pix[i+2] = blueCorrect;


        var colorBits = getColorBits(redCorrect, greenCorrect, blueCorrect);
        if (colors[colorBits] === undefined) colors[colorBits] = [];
        colors[colorBits].push({ x: col, y: row })



        pixelCount++;
    }
    
    console.log(pixels);
    ctx.putImageData(imgData, 0, 0);
}

var btn = document.createElement('button');
btn.addEventListener('click', getThemPixels);
document.getElementsByTagName('body')[0].appendChild(btn);


img = new Image();
img.crossOrigin='';
img.onload = function () {

    //canvas.height = canvas.width * (img.height / img.width);

    /// step 1
    var oc = document.createElement('canvas'),
        octx = oc.getContext('2d');

    oc.width = WIDTH/2;
    oc.height = HEIGHT/2;
    octx.drawImage(img, 0, 0, oc.width, oc.height);

    /// step 2
    octx.drawImage(oc, 0, 0, oc.width, oc.height);

    ctx.drawImage(oc, 0, 0, oc.width, oc.height,
    0, 0, canvas.width, canvas.height);
}
img.src = "http://i.imgur.com/SHo6Fub.jpg";



var getColorBits = function(r, g, b) {
    var bits = colorMapR[r] + colorMapG[g] + colorMapB[b];
    return bits;
};



var getVHDL = function() {
    document.getElementsByTagName('body')[0].appendChild(document.createElement('br'));
    document.getElementsByTagName('body')[0].appendChild(document.createElement('br'));
    var txt = document.createElement('textarea');
    document.getElementsByTagName('body')[0].appendChild(txt);

    var vhdl = "";

    var longest = -1;
    for (var idx in colors) {
        if (!colors.hasOwnProperty(longest)) longest = idx;
        if (colors[idx].length > colors[longest].length) longest = idx;
    }

    for (var bits in colors) {

        if (bits === longest) continue;

        var expr = "when ";
        var LINEBREAK_ON = 6;
        for (var i=0; i<colors[bits].length; i++) {
            if (i !== 0 && (i % LINEBREAK_ON) === 0) expr += "\n\t\t";
            expr += "\"" + concatBinary(colors[bits][i]) + "\"";

            if (i === (colors[bits].length-1)) {
                expr += " =>\n";
            } else {
                expr += "|";
            }
        }

        expr += "red <= \"" + bits.substr(0,3) + "\";\n";
        expr += "green <= \"" + bits.substr(3,3) + "\";\n";
        expr += "blue <= \"" + bits.substr(6,2) + "\";\n";

        vhdl += expr + "\n\n";

    }

    var expr = "when others =>\n\t\t\t";
    expr += "red <= \"" + longest.substr(0,3) + "\";\n\t\t\t";
    expr += "green <= \"" + longest.substr(3,3) + "\";\n\t\t\t";
    expr += "blue <= \"" + longest.substr(6,2) + "\";\n";

    vhdl += expr;

    var blob = new Blob([vhdl], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "img2vhdl.vhd");

    return blob;
};

var concatBinary = function(point) {
    return getBinary(point.x, 10) + getBinary(point.y, 10);
}

var getBinary = function(num, length) {
    var bin = num.toString(2);

    while (bin.length !== length) {
        bin = '0' + bin;
    }

    return bin;
}