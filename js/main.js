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

var cog = new Image();
cog.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABK1JREFUeNqMVt1ZGzkUvVfS4IW1l8GO82w6IBXE7mCpAFMB+Pt4Z6iApALcAe4AU0HoAJfg7BPYHinnXmmciX+y0YdmJHnQ0bk/R5cvh5cUyFPwRD4EChgEvGWMB36R3+JaiTkmD5gOs8yNb25uLlerFf1pM2yIGA82TEY7xow1oj4GBU6S6yywPNG4JwDH+XGv0Whs7ndN8n97mmPsLCSYgy7ImPQE/pFDyAF+7L0fgTNFUDBcLal90taD1doQ/T6NT9DnW8zkT+jJuQVYukG3hifCVk/L3JOxMBa8VVlSp9MhHKLaB+zpNo1fdgEpmByuMqUAV5viOQLwXNax9KBAFNEEpN1pUwnQmvl6aTza6zNjrCKaymeyOdYAMgfg18iG4T/qw+AC94zvpzDjcwqOXo3VGH26H0xMZ7jPxgT0R2zUi4BYt6bAfEbJvJFZKA4ODgZ5nhcJLE9mk35X21vWC/TXKmiwr2xszoQd/PQv3t/QCzY2twpqBpb5FKOp+hCgzWaTWq0W1Xx0ij5An9WC5VtiLMwvNBrVaSGMvQk5jHQVPN7sb0HzAtE+QJrNgrcUNEARieWCut0ugR0tl8sKcJ5Ahc3jRviPK8ZGTaaBwGKyT+gTiwM4a3Jrba6MbeVXo5F4kp9shn29ndUYC9vLirGDXzRhrYhD8DME5Hkg22df5rDYS/RXmVIsaP/Q/SXs600YnifTjbeSWliEdTYb3QyTqYfdDKTL4B1KS6tVqf6SgGq3P9BvZGpvNIrPCgVKZlGlCDQDxJiCjVppCab05DJHzb+b1Gm36X80cVjLuzozexs0f6IgRkA5XRhzIixRL1+IzhwdHVHrn1Y9oXe1i10aKT6bGGhg1CKK+cT0zCGCs0oXTIogybJMw/779//o48duMvnO9rzLn+Kz8wgS5Shqo4njpCoOQA5Ajb8adHh4SMvVghaLhYb/HsBip88krNVISSEigOlhjmi0LziNhr6wOsgO9C1339vbGznnNAU2AM9Svk235cqKieKGkldAf7DGvTrjnjJnzyQoMu0ZTuZgUqvmlYR+f39XIE4uqCX1E/rDZpCYmKwOOmivAfYK9KF1AM7EdG4uAMLAOjmQideQXOJQkyUisqYiFRhtSFbxCxj8do0T30dmTvLhC+an0MZZVBHX09tBTG4qFigZEJEChjTIEwtRik81Qa7uOQU0IrYAe7FRjqYw6SlYjgAyN1GmHsFIGPfVnxzFuFITKEkfYK+oWZ5qKlIkcZ7UE92oXBmeIgIxtAO5UtSHqo9uiLW+sme5ejSIRASeAFR4LYy8MMzL1aq3EYWzJF28BgMEzGYpBkrMKelgl+P6uTcVY8NjLYyYPwMTCcufSaouH6al9xNJcjC82vDb9uVZKbrWIumNO+waVsu1TCC+Wxcg6xaSpsZSYM2wLO9/U8qZWH+wztQnsfAxV/E3MIKZVf1FsmJVV8mamhEmxZ0X7sSsABsGv1tZJGejmptU7FBUDYzPAXQBwFEEl+9+stFEroJEci2ELwIMmZuWoSTE9DYYcWVCjlJrZWMpeBhlAEqBiulPE84S3ixU5gSTwGGOdyEVNJXxA8nPevshwABHktBS1YoQ+QAAAABJRU5ErkJggg=='; // Set source path

var rotation = 0;
var spinHandle;
function draw() {
    ctx.globalCompositeOperation = 'destination-over';
    ctx.save();
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.translate(WIDTH/2, HEIGHT/2); // to get it in the origin
    rotation += 1;
    ctx.rotate(rotation * Math.PI / 64); //rotate in origin
    ctx.translate(-13.5, -13.5); //put it back
    ctx.drawImage(cog, 0, 0);
    ctx.restore();
}

function showSpinner() { spinHandle = setInterval(draw, 10); }
function hideSpinner() { clearInterval(spinHandle); ctx.globalCompositeOperation = 'source-over'; }

// ------------------------------------------------------------------------

img = new Image();
img.crossOrigin='';
img.onload = function () {

    var aspect = img.width / img.height;

    console.log("My aspect ratio is", aspect)


    /// step 1
    var oc = document.createElement('canvas'),
        octx = oc.getContext('2d');

    oc.width = WIDTH;
    oc.height = HEIGHT;
    octx.drawImage(img, 0, 0, oc.width, oc.height);

    /// step 2
    octx.drawImage(oc, 0, 0, oc.width, oc.height);

    hideSpinner();

    ctx.drawImage(oc, 0, 0, oc.width, oc.height);//,
    // 0, 0, canvas.width, canvas.height);

    document.getElementById('btnColorize').disabled=false;
    document.getElementById('btnGetVHDL').disabled=true;
}
img.src = "http://i.imgur.com/SHo6Fub.jpg";
showSpinner()

// ------------------------------------------------------------------------

function loadImage() {
    $('#fileInput').bind('change', function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function(evt) {
            img.src = evt.target.result;
        };
        setTimeout(function() {
            reader.readAsDataURL(file);
        }, 10);
    });

    ctx.fillStyle = "#fff";
    ctx.fillRect(0,0,WIDTH,HEIGHT);
    showSpinner();

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