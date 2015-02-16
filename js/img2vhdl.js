var img2vhdl = img2vhdl || (function() {

    // global namespace
    var _this;

    // the global instance of the canvas to be used
    var _canvas, _context;

    // VGA image dimensions
    var _width, _height;

    // These defaults are based on 8-bit color
    var colorDepth = { 'r' : 8, 'g' : 8, 'b' : 4 };
    var colorStep = {
        'r' : Math.round(256 / (colorDepth['r']-1)),
        'g' : Math.round(256 / (colorDepth['g']-1)),
        'b' : Math.round(256 / (colorDepth['b']-1))
    };

    var colorMapR = {}, colorMapG = {}, colorMapB = {};
    for (var i=0; i<colorDepth['r']; i++) {
        var color = constrain(i*colorStep['r'], 255);
        colorMapR[color] = getBinary(i, 3);
    }
    for (var i=0; i<colorDepth['g']; i++) {
        var color = constrain(i*colorStep['g'], 255);
        colorMapG[color] = getBinary(i, 3);
    }
    for (var i=0; i<colorDepth['b']; i++) {
        var color = constrain(i*colorStep['b'], 255);
        colorMapB[color] = getBinary(i, 2);
    }

    // ------------------------------------------------------------------------

    function img2vhdl(canvas) {
        _canvas = canvas;
        _context = canvas.getContext('2d');
        _width = _canvas.width;
        _height = canvas.height;

        this.pixels = [];   // 2D array [480][640] of each RGB Pixel
        this.colors = {};   // each binary color as a property that houses
                            // an array of point objects (x, y of each pixel)

        this.colorMaps = {
            'r': colorMapR,
            'g': colorMapG,
            'b': colorMapB
        }

        _this = this;

    }

    // ------------------------------------------------------------------------
    // Public Methods
    // ------------------------------------------------------------------------

    img2vhdl.prototype.getPixelsAndColorize = function() {
        var imgData = _context.getImageData(0,0,_width,_height);
        var pix = imgData.data;
        var pixelCount = 0;

        for (var i=0; i < pix.length; i += 4) {
            // calculate the current row, col (x, y)
            var row = Math.floor(pixelCount / _width);
            var col = pixelCount % _width;
            
            // Color correct to 8-bit VGA
            var redCorrect = constrain(Math.round(pix[i]/colorStep['r'])*colorStep['r'], 255);
            var greenCorrect = constrain(Math.round(pix[i+1]/colorStep['g'])*colorStep['g'], 255);
            var blueCorrect = constrain(Math.round(pix[i+2]/colorStep['b'])*colorStep['b'], 255);
    
            // Put pixel in the correct row
            var pixel = {
                'R': redCorrect,
                'G': greenCorrect,
                'B': blueCorrect
            }
            if (this.pixels[row] === undefined) this.pixels[row] = [];
            this.pixels[row].push(pixel);
            
            // set the pixels of the canvas to the 8-bit color version
            pix[i] = redCorrect;
            pix[i+1] = greenCorrect;
            pix[i+2] = blueCorrect;
            // pix[i+3] is the alpha channel

            // group like colors together
            var colorBits = getColorBits(redCorrect, greenCorrect, blueCorrect);
            if (this.colors[colorBits] === undefined) this.colors[colorBits] = [];
            this.colors[colorBits].push({ x: col, y: row })

            pixelCount++;
        }
        
        _context.putImageData(imgData, 0, 0);
    };

    // ------------------------------------------------------------------------

    img2vhdl.prototype.getVHDL = function(filename) {
        var vhdl_top = "library ieee;\nuse ieee.std_logic_1164.all;\n\nentity img2vhdl is\n\tport(\n" + 
                   "\t\tpixel_x\t: in\tstd_logic_vector(9 downto 0);\n" +
                   "\t\tpixel_y\t: in\tstd_logic_vector(9 downto 0);\n" +
                   "\t\tred\t\t: out\tstd_logic_vector(2 downto 0);\n" +
                   "\t\tgreen\t\t: out\tstd_logic_vector(2 downto 0);\n" +
                   "\t\tblue\t\t: out\tstd_logic_vector(1 downto 0)\n\t);\n" +
                   "end img2vhdl;\n\n" +
                   "architecture behavioral of img2vhdl is\nbegin\n\n" +
                   "\tprocess(pixel_x,pixel_y)\n" +
                   "\t\tvariable xy : std_logic_vector(19 downto 0) := (others=>'0');\n" +
                   "\tbegin\n" +
                   "\t\txy := pixel_x & pixel_y;\n\n" +
                   "\t\tcase xy is\n\n";
        var vhdl_bottom = "\t\tend case;\n\n\tend process;\n\nend behavioral;";

        var vhdl = "";

        var longest = getLongestColorBits();
        console.log(longest)

        for (var bits in this.colors) {

            if (bits === longest) continue;

            var expr = "\t\t\twhen ";
            var LINEBREAK_ON = 6;
            for (var i=0; i<this.colors[bits].length; i++) {
                if (i !== 0 && (i % LINEBREAK_ON) === 0) expr += "\n\t\t\t\t  ";

                expr += "\"" + concatBinary(this.colors[bits][i]) + "\"";

                if (i === (this.colors[bits].length-1)) {
                    expr += " =>\n\t\t\t\t";
                } else {
                    expr += "|";
                }
            }

            expr += "red <= \"" + bits.substr(0,3) + "\";\n\t\t\t\t";
            expr += "green <= \"" + bits.substr(3,3) + "\";\n\t\t\t\t";
            expr += "blue <= \"" + bits.substr(6,2) + "\";\n";

            vhdl += expr + "\n\n";

        }

        var expr = "when others =>\n\t\t\t";
        expr += "red <= \"" + longest.substr(0,3) + "\";\n\t\t\t";
        expr += "green <= \"" + longest.substr(3,3) + "\";\n\t\t\t";
        expr += "blue <= \"" + longest.substr(6,2) + "\";\n";

        vhdl += expr;

        // concat it all together now (♫ all together now ♫)
        vhdl = vhdl_top + vhdl + vhdl_bottom;

        var blob = new Blob([vhdl], {type: "text/plain;charset=utf-8"});
        saveAs(blob, filename);
    };

    img2vhdl.prototype.findDuplicates = function() {

        for (var bits in this.colors) {

        }
    };


    // ------------------------------------------------------------------------
    // Helpers (private methods)
    // ------------------------------------------------------------------------

    function constrain(a, b) { return (a > b) ? b : a; }

    function getBinary(num, length) {
        var bin = num.toString(2);

        while (bin.length !== length) {
            bin = '0' + bin;
        }

        return bin;
    }

    function getColorBits(r, g, b) {
        return colorMapR[r] + colorMapG[g] + colorMapB[b];
    }

    function concatBinary(point) {
        return getBinary(point.x, 10) + getBinary(point.y, 10);
    }

    function getLongestColorBits() {
        var longest = -1;
        for (var idx in _this.colors) {
            if (!_this.colors.hasOwnProperty(longest)) longest = idx;
            if (_this.colors[idx].length > _this.colors[longest].length) longest = idx;
        }

        return longest;
    }


    return img2vhdl;
})();