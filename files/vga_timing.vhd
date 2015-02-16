library ieee;
use ieee.std_logic_1164.all;
use ieee.numeric_std.all;

entity vga_timing is
	port(
		clk 			: in   std_logic;	-- Input clk (50MHz)
		rst 			: in   std_logic; -- Async Reset
		hs 			: out  std_logic; -- Low-asserted horizontal sync
		vs 			: out  std_logic; -- Low-asserted vertical sync
		pixel_x 		: out  std_logic_vector (9 downto 0); -- VGA pixel col
		pixel_y 		: out  std_logic_vector (9 downto 0); -- VGA pixel row
		last_column : out  std_logic; -- indicates if pixel_x is last visible col
		last_row 	: out  std_logic; -- indicates if pixel_y is last visible row
		blank 		: out  std_logic  -- indicates that current pixel is part of
												-- a retrace and the output should be blank
	);
end vga_timing;

architecture behavioral of vga_timing is
	signal pixel_en, v_en : std_logic := '0';
	signal h_counter : unsigned(9 downto 0) := (others=>'0');
	signal v_counter : unsigned(9 downto 0) := (others=>'0');
	
	-- VGA constants for a 25MHz, 640x480 pixel display
	constant H_MAX 	: natural := 800; -- max horizontal clocks
	constant H_T_DISP : natural := 640; -- display time
	constant H_T_FP 	: natural := 656;  -- front porch
	constant H_T_PW 	: natural := 752;  -- pulse width
	constant H_T_BP 	: natural := 800;  -- back porch
	
	-- Timing constraints for Horizontal Timer (0-799)
	-- 0 			<= h_counter < H_T_DISP : HS is high (in draw stage)
	-- H_T_DISP <= h_counter < H_T_FP	: HS is high (in retrace stage)
	-- H_T_FP   <= h_counter < H_T_PW	: HS is low  (in retrace stage)
	-- H_T_PW	<= h_counter < H_T_BP	: HS is high (in retrace stage)
	
	constant V_MAX 	: natural := 521; -- max vertical lines
	constant V_T_DISP : natural := 480; -- display lines
	constant V_T_FP 	: natural := 490;	-- front porch
	constant V_T_PW 	: natural := 492;	-- pulse width
	constant V_T_BP 	: natural := 521;	-- back porch
	
	-- Timing constraints for Vertical Timer (0-520)
	-- 0			<= v_counter < V_T_DISP : VS is high (in draw stage)
	-- V_T_DISP <= v_counter < V_T_FP	: VS is high (in retrace stage)
	-- V_T_FP   <= v_counter < V_T_PW	: VS is low  (in retrace stage) 
	-- V_T_PW	<= v_counter < V_T_BP	: VS is high (in retrace stage)
begin
	-- 50MHz to 25MHz Reg
	process(clk, rst)
	begin
		if (rst='1') then
			pixel_en <= '0';
		elsif (clk'event and clk='1') then
			pixel_en <= not pixel_en;
		end if;
	end process;

	-- Horizontal Pixel Counter
	process(clk, rst, pixel_en)
	begin
		if (rst='1') then
			h_counter <= (others=>'0');
		elsif (clk'event and clk='1') then
			if (pixel_en='1') then
				if (h_counter < (H_MAX-1)) then
					h_counter <= h_counter + 1;
				else
					h_counter <= (others=>'0');
				end if;
			end if;
		end if;
	end process;
	-- Horizontal Counter output
	pixel_x <= std_logic_vector(h_counter);
	hs <= '0' when (h_counter >= H_T_FP and h_counter < H_T_PW) else '1';
	last_column <= '1' when (h_counter = (H_T_DISP-1)) else '0';
	
	-- Vertical Pixel Counter
	process(clk, rst, pixel_en)
	begin
		if (rst='1') then
			v_counter <= (others=>'0');
		elsif (clk'event and clk='1') then
			if (v_en='1') then
				if (v_counter < (V_MAX-1)) then
					v_counter <= v_counter + 1;
				else
					v_counter <= (others=>'0');
				end if;
			end if;
		end if;
	end process;
	-- Vertical Counter enable select
	v_en <= '1' when (h_counter=(H_MAX-1) and pixel_en='1') else '0';
	-- Vertical Counter output
	pixel_y <= std_logic_vector(v_counter);
	vs <= '0' when (v_counter >= V_T_FP and v_counter < V_T_PW) else '1';
	last_row <= '1' when (v_counter = (V_T_DISP-1)) else '0';
	
	-- Blank Signal
	blank <= '1' when ((h_counter >= H_T_DISP) or (v_counter >= V_T_DISP)) else '0';

end behavioral;

