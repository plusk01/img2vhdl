# img2vhdl

[This JavaScript web app](http://pclusk.com/img2vhdl) utilized HTML5 File and Image APIs with the canvas element to process images and create VHDL-83 synthesizable code.

The app takes an image, and stretches it to fit inside a 640x480 window. Then, you can press the `8-bit Colorize!` button and the JavaScript algorithm will loop through each pixel and turn it into 8-bit RGB using the following color maps:

    colorMapR and colorMapG
    {  
        0   : "000",
        37  : "001",
        74  : "010",
        111 : "011",
        148 : "100",
        185 : "101",
        222 : "110",
        255 : "111"
    }

    colorMapB
    {
        0: "00",
        85: "01",
        170: "10",
        255: "11"
    }

Once 8-bit colorized, press `Get VHDL` to download the generated VHDL file that implements your image in code. This is done in a module that uses a process and a case statement to choose which values of RGB to display given a concatenated xy coordinate.

All you have to do to use this code is implement it in your top-level design as follows:

    img: entity work.img2vhdl
        port map(
            pixel_x=>pixel_x, pixel_y=>pixel_y,
            red=>myRed,green=>myGreen,blue=>myBlue
        );

This code was tested to run on a Digilent Nexys2 with Spartan-3E FPGA. To understand more fully how 640x480 8-bit VGA works on this dev board, consult the reference manual below.

----------------------------------

### Resources ###

- [Demo Website](http://pclusk.com/img2vhdl)
- [Digilent Nexys2 (Spartan3E) Reference Manual](http://www.digilentinc.com/data/products/nexys2/nexys2_rm.pdf)