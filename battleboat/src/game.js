/**
 * Created by Kevin on 2/18/2017.
 */

//=================//
//    Constants    //
//=================//
var CONST = {};
CONST.AVAILABLE_SHIPS = ['carrier', 'battleship', 'destroyer', 'submarine', 'patrolboat'];

// You are player 0 and the computer is player 1
CONST.HUMAN_PLAYER = 0;
CONST.COMPUTER_PLAYER = 1;
CONST.VIRTUAL_PLAYER = 2;

// Possible values for the parameter `type` (string)
CONST.CSS_TYPE_EMPTY = 'empty';
CONST.CSS_TYPE_SHIP = 'ship';
CONST.CSS_TYPE_MISS = 'miss';
CONST.CSS_TYPE_HIT = 'hit';
CONST.CSS_TYPE_SUNK = 'sunk';

// Board code:
CONST.TYPE_EMPTY = 0; // 0 = water (empty)
CONST.TYPE_SHIP = 1; // 1 = undamaged ship
CONST.TYPE_MISS = 2; // 2 = water with a cannonball in it (missed shot)
CONST.TYPE_HIT = 3; // 3 = damaged ship (hit shot)
CONST.TYPE_SUNK = 4; // 4 = sunk ship

// These numbers correspond to CONST.AVAILABLE_SHIPS
// 0) 'carrier' 1) 'battleship' 2) 'destroyer' 3) 'submarine' 4) 'patrolboat'
// This variable is only used when DEBUG_MODE === true.
Game.usedShips = [CONST.UNUSED, CONST.UNUSED, CONST.UNUSED, CONST.UNUSED, CONST.UNUSED];
CONST.USED = 1;
CONST.UNUSED = 0;

//=================//
//      Game       //
//=================//
// Constructor
function Game(size) {
    Game.size = 10; // Default grid size is 10x10
    this.init();
    this.gameOver = false;
}
// Initializes the Game. Also resets the game if previously initialized
Game.prototype.init = function() {
    // Create both boards
    this.humanBoard = new Board(Game.size);
    this.computerBoard = new Board(Game.size);

    // Create both fleets
    this.humanFleet = new Fleet(this.humanBoard, CONST.HUMAN_PLAYER);
    this.computerFleet = new Fleet(this.computerBoard, CONST.COMPUTER_PLAYER);

    // Create the AI
    this.robot = new AI(this);

    // Reset game variables
    Game.placeShipDirection = 0;
    Game.placeShipType = "";
    Game.placeShipCoords = [];
};
// Checks if the game is won
Game.prototype.checkIfWon = function() {
    if (this.computerFleet.allShipsSunk()) {
        document.write("Congratulations, you win! <br />");
        this.gameOver = true;
    } else if (this.humanFleet.allShipsSunk()) {
        document.write("Yarr! The computer sank all your ships. Try again.  <br />");
        this.gameOver = true;
    }
};
// Shoots at the target player on the board.
// Returns {int} Constants.TYPE: What the shot uncovered
Game.prototype.shoot = function(x, y, targetPlayer) {
    var targetBoard;
    var targetFleet;

    // If you're shooting at the player
    if (targetPlayer === CONST.HUMAN_PLAYER) {
        targetBoard = this.humanBoard;
        targetFleet = this.humanFleet;
    }
    // If you're shooting at the computer
    else if (targetPlayer === CONST.COMPUTER_PLAYER) {
        targetBoard = this.computerBoard;
        targetFleet = this.computerFleet;
    } else {
        // Should never be called
        console.log("There was an error trying to find the correct player to target");
    }

    // If they try to shoot somewhere they have already hit a ship
    if (targetBoard.isDamagedShip(x, y)) {
        // If it's the computer
        if(targetBoard === this.humanBoard) {
            // Try again
            this.robot.shoot();
        }
        // If the player makes a wrong input
        else{
            // Get new input and try again
            x = prompt(x);
            y = prompt(y);
            this.shoot(x, y, targetPlayer);
        }
    }
    // If they try to shoot somewhere they have already missed
    else if (targetBoard.isMiss(x, y)) {
        // If it's the computer
        if(targetBoard === this.humanBoard) {
            // Try again
            this.robot.shoot();
        }
        // If the player makes a wrong input
        else{
            // Get new input and try again
            x = prompt(x);
            y = prompt(y);
            this.shoot(x, y, targetPlayer);
        }
    }
    // If they hit a ship
    else if (targetBoard.isUndamagedShip(x, y)) {
        // Update the board/grid
        targetBoard.updateCell(x, y, 'hit', targetPlayer);

        // IMPORTANT: This function needs to be called _after_ updating the cell to a 'hit',
        // because it overrides the CSS class to 'sunk' if we find that the ship was sunk
        targetFleet.findShipByCoords(x, y).incrementDamage(); // increase the damage
        this.checkIfWon();
        return CONST.TYPE_HIT;
    }
    // If they miss
    else {
        targetBoard.updateCell(x, y, 'miss', targetPlayer);
        this.checkIfWon();
        return CONST.TYPE_MISS;
    }
};
// Debugging function used to place all ships and just start
Game.prototype.placeRandomly = function(){
    this.humanFleet.placeShipsRandomly();
    this.computerFleet.placeShipsRandomly();
};

// Returns a random number between min (inclusive) and max (exclusive)
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

//=================//
//      Tests      //
//=================//
// Start the game
var mainGame = new Game(10);

// @ Test 1
// Print arrays of 0s
document.write("Test 1 - Empty Boards <br />");
document.write("Human Board <br />");
mainGame.humanBoard.printBoard();
document.write("Computer Board <br />");
mainGame.computerBoard.printBoard();
document.write("============== <br /><br />");

// @ Test 2
// Should place ships correctly
document.write("Test 2 - Placed Ships <br />");
mainGame.placeRandomly();
document.write("Human Board <br />");
mainGame.humanBoard.printBoard();
document.write("Computer Board <br />");
mainGame.computerBoard.printBoard();
document.write("============== <br /><br />");


// @ Test 3
// Should print an array of 2s and 4s and a win game message
document.write("Test 3 - Kill The Computer <br />");
for (var i = 0; i < Game.size; i++) {
    for(var j = 0; j < Game.size; j++) {
        mainGame.shoot(i, j, CONST.COMPUTER_PLAYER);
        if(mainGame.gameOver){
            break;
        }
    }
    if(mainGame.gameOver){
        break;
    }
}
document.write("Human Board <br />");
mainGame.humanBoard.printBoard();
document.write("Computer Board <br />");
mainGame.computerBoard.printBoard();
document.write("============== <br /><br />");


// @ Test 4 - Invalid Input
// If the user fires somewhere they already have, let them try again
mainGame = new Game(10);

document.write("Test 4 - Invalid Player Input <br />");
mainGame.shoot(0, 0, CONST.COMPUTER_PLAYER);
document.write("Computer Board <br />");
mainGame.computerBoard.printBoard();
mainGame.shoot(0, 0, CONST.COMPUTER_PLAYER);
document.write("Computer Board <br />");
mainGame.computerBoard.printBoard();
document.write("============== <br /><br />");