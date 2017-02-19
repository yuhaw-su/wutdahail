/**
 * Created by Kevin on 2/18/2017.
 */

//=================//
//      Ships      //
//=================//
// Constructor
function Ship(type, playerGrid, player) {
    this.damage = 0;
    this.type = type;
    this.playerBoard = playerGrid;
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
                if (this.playerBoard.cells[x + i][y] === CONST.TYPE_SHIP ||
                    this.playerBoard.cells[x + i][y] === CONST.TYPE_MISS ||
                    this.playerBoard.cells[x + i][y] === CONST.TYPE_SUNK) {
                    return false;
                }
            } else {
                if (this.playerBoard.cells[x][y + i] === CONST.TYPE_SHIP ||
                    this.playerBoard.cells[x][y + i] === CONST.TYPE_MISS ||
                    this.playerBoard.cells[x][y + i] === CONST.TYPE_SUNK) {
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
            this.playerBoard.updateCell(allCells[i].x, allCells[i].y, 'sunk', this.player);
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
                this.playerBoard.cells[x + i][y] = CONST.TYPE_SHIP;
            } else {
                this.playerBoard.cells[x][y + i] = CONST.TYPE_SHIP;
            }
        }
    }

};
// direction === 0 when the ship is facing north/south
// direction === 1 when the ship is facing east/west
Ship.DIRECTION_VERTICAL = 0;
Ship.DIRECTION_HORIZONTAL = 1;