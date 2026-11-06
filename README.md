# 🐪 The Camelculator 🐪
### Camel (C)up Calculator

The Camelculator is an assistant tool to go with the board game Camel Up to determine the odds of camels winning and the value of the betting tiles based on the current board state.

Link Here: [Camelculator](https://mastershane.github.io/build/)

Currently the only way to use the Camelculator is to enter in the current board state and dice state using Camel Code. Squares on the board are separated by a comma (",") going to the goal from left to right. Camels stack within a square with the rightmost camel on the top. Here is an example of Camel Code where yellow is winning `rw,,o,gby`. The dice state needs the remaining dice that have not been rolled. Each round would start something like this `rwgby`.

### Game Versions

A toggle at the top of the page switches between the rules of the two editions. Version 1 has the original five racing camels (orange, blue, green, yellow and white) and five dice, and a leg ends once every die is rolled. In version 1 camel code, `r` is the orange camel and `w` is the white racing camel. Version 2 adds the black and white crazy camels and the gray die, and a leg ends when one die is left in the pyramid. Switching starts a new game, and the choice is remembered in the browser.

### Long Term Bets

Overall winner / loser odds are estimated by playing the rest of the game out thousands of times with random dice (Monte Carlo simulation) and counting how often each camel finishes first and last. The number of simulated games can be changed in the UI; 20,000 games gives odds within about ±0.7%. Future legs assume all six dice are used and no desert / oasis tiles are placed. Expected values are shown for each long term payout (8, 5, 3, 2, 1), since the payout depends on how many correct bets were placed on that camel before yours.

### Camel Code Key

<li>r: Red Camel or Die</li>
<li>g: Green Camel or Die</li>
<li>w: White Camel or Die</li>
<li>u: Blue Camel or Die</li>
<li>y: Yellow Camel or Die</li>
<li>d: Desert Tile</li>
<li>o: Oasis Tile</li>
<li>,,: Blank Space</li>

Todo: 
UI to show camel board
Support finish line in calculations
Click shot term bets to remove color
support chaos camels
    use correct colors in regular camels
    support white and black camels
    support gray die
    move choas camels backwards

