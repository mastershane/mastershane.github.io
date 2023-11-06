# 🐪 The Camelculator 🐪
### Camel (C)up Calculator

The Camelculator is an assistant tool to go with the board game Camel Up to determine the odds of camels winning and the value of the betting tiles based on the current board state.

Link Here: [Camelculator](https://mastershane.github.io/build/)

Currently the only way to use the Camelculator is to enter in the current board state and dice state using Camel Code. Squares on the board are separated by a comma (",") going to the goal from left to right. Camels stack within a square with the rightmost camel on the top. Here is an example of Camel Code where yellow is winning `rw,,o,gby`. The dice state needs the remaining dice that have not been rolled. Each round would start something like this `rwgby`.

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

