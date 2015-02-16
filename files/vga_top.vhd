library ieee;
use ieee.std_logic_1164.all;
use IEEE.NUMERIC_STD.ALL;

entity vga_object is
	Port(
		clk 		: in  std_logic;
		btn 		: in  std_logic_vector (3 downto 0);
		sw 		: in  std_logic_vector (7 downto 0);
		Hsync 	: out  std_logic;
		Vsync 	: out  std_logic;
		vgaRed 	: out  std_logic_vector (2 downto 0);
		vgaGreen : out  std_logic_vector (2 downto 0);
		vgaBlue 	: out  std_logic_vector (1 downto 0)
	);
end vga_object;

architecture behavioral of vga_object is
	signal reset 					: std_logic;
	signal hs_next, vs_next 	: std_logic;
--	signal last_col, last_row	: std_logic;
	signal blank 					: std_logic;
	signal red, red_next			: std_logic_vector(2 downto 0);
	signal green, green_next	: std_logic_vector(2 downto 0);
	signal blue, blue_next		: std_logic_vector(1 downto 0);
	signal pixel_y, pixel_x		: std_logic_vector(9 downto 0);
	
	signal e1Red, e1Green 		: std_logic_vector(2 downto 0);
	signal e1Blue					: std_logic_vector(1 downto 0);
	
	signal e2Red, e2Green 		: std_logic_vector(2 downto 0);
	signal e2Blue					: std_logic_vector(1 downto 0);
	
	signal customRed, customGreen : std_logic_vector(2 downto 0);
	signal customBlue					: std_logic_vector(1 downto 0);
begin
	reset <= btn(3);
	
	vga1: entity work.vga_timing
		port map(
			clk=>clk, rst=>reset, hs=>hs_next,
			pixel_x=>pixel_x, pixel_y=>pixel_y,
--			last_column=>last_col, last_row=>last_row,
			vs=>vs_next, blank=>blank
		);
	
	vga2: entity work.exercise1
		port map(
			pixel_x=>pixel_x,
			red=>e1Red, green=>e1Green, blue=>e1Blue
		);
		
	vga3: entity work.exercise2
		port map(
			pixel_x=>pixel_x, pixel_y=>pixel_y,
			red=>e2Red, green=>e2Green, blue=>e2Blue
		);
		
	vga4: entity work.custom_drawing
		port map(
			pixel_x=>pixel_x, pixel_y=>pixel_y,
			red=>customRed, green=>customGreen, blue=>customBlue
		);
		
	-- Hsync and Vsync reg
	process(clk,reset)
	begin
		if (reset='1') then
			Hsync <= '0';
			Vsync <= '0';
		elsif (clk'event and clk='1') then
			Hsync <= hs_next;
			Vsync <= vs_next;
		end if;
	end process;
	
	-- Color regs
	process(clk,reset)
	begin
		if (reset='1') then
			red <= (others=>'0');
			green <= (others=>'0');
			blue <= (others=>'0');
		elsif (clk'event and clk='1') then
			red <= red_next;
			green <= green_next;
			blue <= blue_next;
		end if;
	end process;
	
	-- next-state
	process(btn,sw)
	begin
		if (btn(2)='1') then
			red_next <= sw(7 downto 5);
			green_next <= sw(4 downto 2);
			blue_next <= sw(1 downto 0);
		elsif (btn(1)='1') then
			red_next <= customRed;
			green_next <= customGreen;
			blue_next <= customBlue;
		elsif (btn(0)='1') then
			red_next <= e2Red;
			green_next <= e2Green;
			blue_next <= e2Blue;
		else
			red_next <= e1Red;
			green_next <= e1Green;
			blue_next <= e1Blue;
		end if;
	end process;
	
	-- Output logic with blank
	vgaRed 	<= red 	when blank='0' else "000";
	vgaGreen <= green when blank='0' else "000";
	vgaBlue 	<= blue 	when blank='0' else "00";

end behavioral;

