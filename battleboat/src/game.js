/**
 * Created by Kevin on 2/18/2017.
 */

// Global Constants
var CONST = {};
CONST.AVAILABLE_SHIPS = ['carrier', 'battleship', 'destroyer', 'submarine', 'patrolboat'];

// You are player 0 and the computer is player 1
// The virtual player is used for generating temporary ships
// for calculating the probability heatmap
CONST.HUMAN_PLAYER = 0;
CONST.COMPUTER_PLAYER = 1;
CONST.VIRTUAL_PLAYER = 2;

// Possible values for the parameter `type` (string)
CONST.CSS_TYPE_EMPTY = 'empty';
CONST.CSS_TYPE_SHIP = 'ship';
CONST.CSS_TYPE_MISS = 'miss';
CONST.CSS_TYPE_HIT = 'hit';
CONST.CSS_TYPE_SUNK = 'sunk';

// Grid code:
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
//      Stats      //
//=================//
// Constructor
function Stats(){
    this.shotsTaken = 0;
    this.shotsHit = 0;
    if (DEBUG_MODE) {
        this.skipCurrentGame = true;
    }
}
Stats.prototype.incrementShots = function() {
    this.shotsTaken++;
};
Stats.prototype.hitShot = function() {
    this.shotsHit++;
};
Stats.prototype.wonGame = function() {
    this.gamesPlayed++;
    this.gamesWon++;
    if (!DEBUG_MODE) {
        ga('send', 'event', 'gameOver', 'win', this.uuid);
    }
};
Stats.prototype.lostGame = function() {
    this.gamesPlayed++;
    if (!DEBUG_MODE) {
        ga('send', 'event', 'gameOver', 'lose', this.uuid);
    }
};


//=================//
//      Game       //
//=================//
// Constructor
function Game(size) {
    Game.size = size;
    this.shotsTaken = 0;
    this.init();
}
Game.size = 10; // Default grid size is 10x10
Game.gameOver = false;
// Checks if the game is won, and if it is, re-initializes the game
Game.prototype.checkIfWon = function() {
    if (this.computerFleet.allShipsSunk()) {
        alert('Congratulations, you win!');
        Game.gameOver = true;
        Game.stats.wonGame();
        Game.stats.syncStats();
        Game.stats.updateStatsSidebar();
        this.showRestartSidebar();
    } else if (this.humanFleet.allShipsSunk()) {
        alert('Yarr! The computer sank all your ships. Try again.');
        Game.gameOver = true;
        Game.stats.lostGame();
        Game.stats.syncStats();
        Game.stats.updateStatsSidebar();
        this.showRestartSidebar();
    }
};
// Shoots at the target player on the board.
// Returns {int} Constants.TYPE: What the shot uncovered
Game.prototype.shoot = function(x, y, targetPlayer) {
    var targetGrid;
    var targetFleet;
    if (targetPlayer === CONST.HUMAN_PLAYER) {
        targetGrid = this.humanBoard;
        targetFleet = this.humanFleet;
    } else if (targetPlayer === CONST.COMPUTER_PLAYER) {
        targetGrid = this.computerBoard;
        targetFleet = this.computerFleet;
    } else {
        // Should never be called
        console.log("There was an error trying to find the correct player to target");
    }

    if (targetGrid.isDamagedShip(x, y)) {
        return null;
    } else if (targetGrid.isMiss(x, y)) {
        return null;
    } else if (targetGrid.isUndamagedShip(x, y)) {
        // update the board/grid
        targetGrid.updateCell(x, y, 'hit', targetPlayer);
        // IMPORTANT: This function needs to be called _after_ updating the cell to a 'hit',
        // because it overrides the CSS class to 'sunk' if we find that the ship was sunk
        targetFleet.findShipByCoords(x, y).incrementDamage(); // increase the damage
        this.checkIfWon();
        return CONST.TYPE_HIT;
    } else {
        targetGrid.updateCell(x, y, 'miss', targetPlayer);
        this.checkIfWon();
        return CONST.TYPE_MISS;
    }
};
// Initializes the Game. Also resets the game if previously initialized
Game.prototype.init = function() {
    this.humanBoard = new Board(Game.size);
    this.computerBoard = new Board(Game.size);
    this.humanFleet = new Fleet(this.humanBoard, CONST.HUMAN_PLAYER);
    this.computerFleet = new Fleet(this.computerBoard, CONST.COMPUTER_PLAYER);

    this.robot = new AI(this);
    Game.stats = new Stats();

    // Reset game variables
    this.shotsTaken = 0;
    this.readyToPlay = false;
    this.placingOnBoard = false;
    Game.placeShipDirection = 0;
    Game.placeShipType = '';
    Game.placeShipCoords = [];
};
// Debugging function used to place all ships and just start
Game.prototype.placeRandomly = function(e){
    e.target.removeEventListener(e.type, arguments.callee);
    e.target.self.humanFleet.placeShipsRandomly();
    e.target.self.readyToPlay = true;
    document.getElementById('roster-sidebar').setAttribute('class', 'hidden');
    this.setAttribute('class', 'hidden');
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
            continue;
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

//=================//
//      Board      //
//=================//
// Constructor
function Board(size){
    this.size = size;
    this.cells = [];
    this.init();
}

// Initialize all cells in the board
Board.prototype.init = function() {
    for (var x = 0; x < this.size; x++) {
        var row = [];
        this.cells[x] = row;
        for (var y = 0; y < this.size; y++) {
            row.push(CONST.TYPE_EMPTY);
        }
    }
};
// Updates the cell's CSS class based on the type passed in
Board.prototype.updateCell = function(x, y, type, targetPlayer) {
    var player;
    if (targetPlayer === CONST.HUMAN_PLAYER) {
        player = 'human-player';
    } else if (targetPlayer === CONST.COMPUTER_PLAYER) {
        player = 'computer-player';
    } else {
        // Should never be called
        console.log("There was an error trying to find the correct player's grid");
    }

    switch (type) {
        case CONST.CSS_TYPE_EMPTY:
            this.cells[x][y] = CONST.TYPE_EMPTY;
            break;
        case CONST.CSS_TYPE_SHIP:
            this.cells[x][y] = CONST.TYPE_SHIP;
            break;
        case CONST.CSS_TYPE_MISS:
            this.cells[x][y] = CONST.TYPE_MISS;
            break;
        case CONST.CSS_TYPE_HIT:
            this.cells[x][y] = CONST.TYPE_HIT;
            break;
        case CONST.CSS_TYPE_SUNK:
            this.cells[x][y] = CONST.TYPE_SUNK;
            break;
        default:
            this.cells[x][y] = CONST.TYPE_EMPTY;
            break;
    }
    var classes = ['grid-cell', 'grid-cell-' + x + '-' + y, 'grid-' + type];
    document.querySelector('.' + player + ' .grid-cell-' + x + '-' + y).setAttribute('class', classes.join(' '));
};
// Checks to see if a cell contains an undamaged ship
// Returns boolean
Board.prototype.isUndamagedShip = function(x, y) {
    return this.cells[x][y] === CONST.TYPE_SHIP;
};
// Checks to see if the shot was missed. This is equivalent
// to checking if a cell contains a cannonball
// Returns boolean
Board.prototype.isMiss = function(x, y) {
    return this.cells[x][y] === CONST.TYPE_MISS;
};
// Checks to see if a cell contains a damaged ship,
// either hit or sunk.
// Returns boolean
Board.prototype.isDamagedShip = function(x, y) {
    return this.cells[x][y] === CONST.TYPE_HIT || this.cells[x][y] === CONST.TYPE_SUNK;
};


//=================//
//      Fleet      //
//=================//
// Constructor
function Fleet(playerGrid, player) {
    this.numShips = CONST.AVAILABLE_SHIPS.length;
    this.playerGrid = playerGrid;
    this.player = player;
    this.fleetRoster = [];
    this.populate();
}

// Populates a fleet
Fleet.prototype.populate = function() {
    for (var i = 0; i < this.numShips; i++) {
        // loop over the ship types when numShips > Constants.AVAILABLE_SHIPS.length
        var j = i % CONST.AVAILABLE_SHIPS.length;
        this.fleetRoster.push(new Ship(CONST.AVAILABLE_SHIPS[j], this.playerGrid, this.player));
    }
};
// Places the ship and returns whether or not the placement was successful
// Returns boolean
Fleet.prototype.placeShip = function(x, y, direction, shipType) {
    var shipCoords;
    for (var i = 0; i < this.fleetRoster.length; i++) {
        var shipTypes = this.fleetRoster[i].type;

        if (shipType === shipTypes &&
            this.fleetRoster[i].isLegal(x, y, direction)) {
            this.fleetRoster[i].create(x, y, direction, false);
            shipCoords = this.fleetRoster[i].getAllShipCells();

            for (var j = 0; j < shipCoords.length; j++) {
                this.playerGrid.updateCell(shipCoords[j].x, shipCoords[j].y, 'ship', this.player);
            }
            return true;
        }
    }
    return false;
};
// Places ships randomly on the board
// TODO: Avoid placing ships too close to each other
Fleet.prototype.placeShipsRandomly = function() {
    var shipCoords;
    for (var i = 0; i < this.fleetRoster.length; i++) {
        var illegalPlacement = true;

        // Prevents the random placement of already placed ships
        if(this.player === CONST.HUMAN_PLAYER && Game.usedShips[i] === CONST.USED) {
            continue;
        }
        while (illegalPlacement) {
            var randomX = Math.floor(10*Math.random());
            var randomY = Math.floor(10*Math.random());
            var randomDirection = Math.floor(2*Math.random());

            if (this.fleetRoster[i].isLegal(randomX, randomY, randomDirection)) {
                this.fleetRoster[i].create(randomX, randomY, randomDirection, false);
                shipCoords = this.fleetRoster[i].getAllShipCells();
                illegalPlacement = false;
            } else {
                continue;
            }
        }
        if (this.player === CONST.HUMAN_PLAYER && Game.usedShips[i] !== CONST.USED) {
            for (var j = 0; j < shipCoords.length; j++) {
                this.playerGrid.updateCell(shipCoords[j].x, shipCoords[j].y, 'ship', this.player);
                Game.usedShips[i] = CONST.USED;
            }
        }
    }
};
// Finds a ship by location
// Returns the ship object located at (x, y)
// If no ship exists at (x, y), this returns null instead
Fleet.prototype.findShipByCoords = function(x, y) {
    for (var i = 0; i < this.fleetRoster.length; i++) {
        var currentShip = this.fleetRoster[i];
        if (currentShip.direction === Ship.DIRECTION_VERTICAL) {
            if (y === currentShip.yPosition &&
                x >= currentShip.xPosition &&
                x < currentShip.xPosition + currentShip.shipLength) {
                return currentShip;
            } else {
                continue;
            }
        } else {
            if (x === currentShip.xPosition &&
                y >= currentShip.yPosition &&
                y < currentShip.yPosition + currentShip.shipLength) {
                return currentShip;
            } else {
                continue;
            }
        }
    }
    return null;
};
// Finds a ship by its type
// Param shipType is a string
// Returns the ship object that is of type shipType
// If no ship exists, this returns null.
Fleet.prototype.findShipByType = function(shipType) {
    for (var i = 0; i < this.fleetRoster.length; i++) {
        if (this.fleetRoster[i].type === shipType) {
            return this.fleetRoster[i];
        }
    }
    return null;
};
// Checks to see if all ships have been sunk
// Returns boolean
Fleet.prototype.allShipsSunk = function() {
    for (var i = 0; i < this.fleetRoster.length; i++) {
        // If one or more ships are not sunk, then the sentence "all ships are sunk" is false.
        if (this.fleetRoster[i].sunk === false) {
            return false;
        }
    }
    return true;
};


//=================//
//      Ships      //
//=================//
// Constructor
function Ship(type, playerGrid, player) {
    this.damage = 0;
    this.type = type;
    this.playerGrid = playerGrid;
    this.player = player;

    switch (this.type) {
        case CONST.AVAILABLE_SHIPS[0]:
            this.shipLength = 5;
            break;
        case CONST.AVAILABLE_SHIPS[1]:
            this.shipLength = 4;
            break;
        case CONST.AVAILABLE_SHIPS[2]:
            this.shipLength = 3;
            break;
        case CONST.AVAILABLE_SHIPS[3]:
            this.shipLength = 3;
            break;
        case CONST.AVAILABLE_SHIPS[4]:
            this.shipLength = 2;
            break;
        default:
            this.shipLength = 3;
            break;
    }
    this.maxDamage = this.shipLength;
    this.sunk = false;
}

// Checks to see if the placement of a ship is legal
// Returns boolean
Ship.prototype.isLegal = function(x, y, direction) {
    // first, check if the ship is within the grid...
    if (this.withinBounds(x, y, direction)) {
        // ...then check to make sure it doesn't collide with another ship
        for (var i = 0; i < this.shipLength; i++) {
            if (direction === Ship.DIRECTION_VERTICAL) {
                if (this.playerGrid.cells[x + i][y] === CONST.TYPE_SHIP ||
                    this.playerGrid.cells[x + i][y] === CONST.TYPE_MISS ||
                    this.playerGrid.cells[x + i][y] === CONST.TYPE_SUNK) {
                    return false;
                }
            } else {
                if (this.playerGrid.cells[x][y + i] === CONST.TYPE_SHIP ||
                    this.playerGrid.cells[x][y + i] === CONST.TYPE_MISS ||
                    this.playerGrid.cells[x][y + i] === CONST.TYPE_SUNK) {
                    return false;
                }
            }
        }
        return true;
    } else {
        return false;
    }
};
// Checks to see if the ship is within bounds of the grid
// Returns boolean
Ship.prototype.withinBounds = function(x, y, direction) {
    if (direction === Ship.DIRECTION_VERTICAL) {
        return x + this.shipLength <= Game.size;
    } else {
        return y + this.shipLength <= Game.size;
    }
};
// Increments the damage counter of a ship
// Returns Ship
Ship.prototype.incrementDamage = function() {
    this.damage++;
    if (this.isSunk()) {
        this.sinkShip(false); // Sinks the ship
    }
};
// Checks to see if the ship is sunk
// Returns boolean
Ship.prototype.isSunk = function() {
    return this.damage >= this.maxDamage;
};
// Sinks the ship
Ship.prototype.sinkShip = function(virtual) {
    this.damage = this.maxDamage; // Force the damage to exceed max damage
    this.sunk = true;

    // Make the CSS class sunk, but only if the ship is not virtual
    if (!virtual) {
        var allCells = this.getAllShipCells();
        for (var i = 0; i < this.shipLength; i++) {
            this.playerGrid.updateCell(allCells[i].x, allCells[i].y, 'sunk', this.player);
        }
    }
};
/**
 * Gets all the ship cells
 *
 * Returns an array with all (x, y) coordinates of the ship:
 * e.g.
 * [
 *	{'x':2, 'y':2},
 *	{'x':3, 'y':2},
 *	{'x':4, 'y':2}
 * ]
 */
Ship.prototype.getAllShipCells = function() {
    var resultObject = [];
    for (var i = 0; i < this.shipLength; i++) {
        if (this.direction === Ship.DIRECTION_VERTICAL) {
            resultObject[i] = {'x': this.xPosition + i, 'y': this.yPosition};
        } else {
            resultObject[i] = {'x': this.xPosition, 'y': this.yPosition + i};
        }
    }
    return resultObject;
};
// Initializes a ship with the given coordinates and direction (bearing).
// If the ship is declared "virtual", then the ship gets initialized with
// its coordinates but DOESN'T get placed on the grid.
Ship.prototype.create = function(x, y, direction, virtual) {
    // This function assumes that you've already checked that the placement is legal
    this.xPosition = x;
    this.yPosition = y;
    this.direction = direction;

    // If the ship is virtual, don't add it to the grid.
    if (!virtual) {
        for (var i = 0; i < this.shipLength; i++) {
            if (this.direction === Ship.DIRECTION_VERTICAL) {
                this.playerGrid.cells[x + i][y] = CONST.TYPE_SHIP;
            } else {
                this.playerGrid.cells[x][y + i] = CONST.TYPE_SHIP;
            }
        }
    }

};
// direction === 0 when the ship is facing north/south
// direction === 1 when the ship is facing east/west
Ship.DIRECTION_VERTICAL = 0;
Ship.DIRECTION_HORIZONTAL = 1;


//=================//
//      AI         //
//=================//
// Constructor
function AI(gameObject) {
    this.gameObject = gameObject;
    this.virtualGrid = new Board(Game.size);
    this.virtualFleet = new Fleet(this.virtualGrid, CONST.VIRTUAL_PLAYER);
}





// Returns a random number between min (inclusive) and max (exclusive)
function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

// Toggles on or off DEBUG_MODE
function setDebug(val) {
    DEBUG_MODE = val;
}



// Start the game
setDebug(true);
var mainGame = new Game(10);
