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
    Game.size = size;
    this.shotsTaken = 0;
    this.init();
    this.readyToPlay = false;
    this.placingOnBoard = false;

    Game.size = 10; // Default grid size is 10x10
    Game.gameOver = false;
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
    this.shotsTaken = 0;
    this.readyToPlay = false;
    this.placingOnBoard = false;
    Game.placeShipDirection = 0;
    Game.placeShipType = '';
    Game.placeShipCoords = [];
};
// Checks if the game is won
Game.prototype.checkIfWon = function() {
    if (this.computerFleet.allShipsSunk()) {
        console.log('Congratulations, you win!');
        Game.gameOver = true;
    } else if (this.humanFleet.allShipsSunk()) {
        console.log('Yarr! The computer sank all your ships. Try again.');
        Game.gameOver = true;
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

    if (targetBoard.isDamagedShip(x, y)) {
        return null;
    } else if (targetBoard.isMiss(x, y)) {
        return null;
    } else if (targetBoard.isUndamagedShip(x, y)) {
        // update the board/grid
        targetBoard.updateCell(x, y, 'hit', targetPlayer);
        // IMPORTANT: This function needs to be called _after_ updating the cell to a 'hit',
        // because it overrides the CSS class to 'sunk' if we find that the ship was sunk
        targetFleet.findShipByCoords(x, y).incrementDamage(); // increase the damage
        this.checkIfWon();
        return CONST.TYPE_HIT;
    } else {
        targetBoard.updateCell(x, y, 'miss', targetPlayer);
        this.checkIfWon();
        return CONST.TYPE_MISS;
    }
};
// Debugging function used to place all ships and just start
Game.prototype.placeRandomly = function(){
    this.humanFleet.placeShipsRandomly();
    this.readyToPlay = true;
};
// Ends placing the current ship
Game.prototype.endPlacing = function(shipType) {
    document.getElementById(shipType).setAttribute('class', 'placed');

    // Mark the ship as 'used'
    Game.usedShips[CONST.AVAILABLE_SHIPS.indexOf(shipType)] = CONST.USED;

    // Wipe out the variable when you're done with it
    Game.placeShipDirection = null;
    Game.placeShipType = '';
    Game.placeShipCoords = [];
};
// Checks whether or not all ships are done placing
// Returns boolean
Game.prototype.areAllShipsPlaced = function() {
    var playerRoster = document.querySelectorAll('.fleet-roster li');
    for (var i = 0; i < playerRoster.length; i++) {
        if (playerRoster[i].getAttribute('class') === 'placed') {

        } else {
            return false;
        }
    }
    // Reset temporary variables
    Game.placeShipDirection = 0;
    Game.placeShipType = '';
    Game.placeShipCoords = [];
    return true;
};

// Returns a random number between min (inclusive) and max (exclusive)
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}
// Toggles on or off DEBUG_MODE
function setDebug(val) {
    DEBUG_MODE = val;
}


//=================//
//      Tests      //
//=================//
// Start the game
setDebug(false);
var mainGame = new Game(10);

mainGame.humanBoard.printBoard();
document.write("<br />");

mainGame.placeRandomly();
mainGame.humanBoard.printBoard();
document.write("<br />");

mainGame.shoot(0,0, CONST.HUMAN_PLAYER);
mainGame.humanBoard.printBoard();
document.write("<br />");

for (var i = 0; i < 10; i++) {
    for(var j=0; j<10; j++) {
        mainGame.shoot(i, j, CONST.HUMAN_PLAYER);
    }
}
mainGame.humanBoard.printBoard();
document.write("<br />");