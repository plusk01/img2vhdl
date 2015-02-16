var WIDTH = 640, HEIGHT = 480;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var DEFAULT_VHDL_FILENAME = 'img2vhdl.vhd'
var vhdlFileName = DEFAULT_VHDL_FILENAME;

// setup canvas to appropriate dimensions
canvas.width = WIDTH;
canvas.height = HEIGHT;

// create the img2vhdl processor object
var i2v = new img2vhdl(canvas);

// ------------------------------------------------------------------------

img = new Image();
img.crossOrigin='';
img.onload = function () {

    /// step 1
    var oc = document.createElement('canvas'),
        octx = oc.getContext('2d');

    oc.width = WIDTH///2;
    oc.height = HEIGHT//2;
    octx.drawImage(img, 0, 0, oc.width, oc.height);

    /// step 2
    octx.drawImage(oc, 0, 0, oc.width, oc.height);

    ctx.drawImage(oc, 0, 0, oc.width, oc.height,
    0, 0, canvas.width, canvas.height);

    document.getElementById('btnColorize').disabled=false;
    document.getElementById('btnGetVHDL').disabled=true;
}
img.src = "http://i.imgur.com/SHo6Fub.jpg";

// ------------------------------------------------------------------------

function loadImage() {
    $('#fileInput').bind('change', function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function(evt) {
            img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
    });
    $('#fileInput').click();
}

// ------------------------------------------------------------------------

function colorize() {
    i2v.getPixelsAndColorize();

    document.getElementById('btnGetVHDL').disabled=false;
}

// ------------------------------------------------------------------------

var txt = document.getElementById('filename');
txt.addEventListener('keyup', function() {

    if (!txt.value) vhdlFileName = DEFAULT_VHDL_FILENAME;
    else {
        vhdlFileName = txt.value;
    }

    // update button
    var span = document.getElementById('vhdlFileName');
    span.innerHTML = vhdlFileName;
});

// ------------------------------------------------------------------------

function getVHDL() {
    i2v.getVHDL(vhdlFileName);
}