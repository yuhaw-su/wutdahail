/**
 * Created by Kevin on 2/18/2017.
 */
//=================//
//      Fleet      //
//=================//
// Constructor
function Fleet(playerGrid, player) {
    this.numShips = CONST.AVAILABLE_SHIPS.length;
    this.playerBoard = playerGrid;
    this.player = player;
    this.fleetRoster = [];
    this.populate();
}

// Populates a fleet
Fleet.prototype.populate = function() {
    for (var i = 0; i < this.numShips; i++) {
        // loop over the ship types when numShips > Constants.AVAILABLE_SHIPS.length
        var j = i % CONST.AVAILABLE_SHIPS.length;
        this.fleetRoster.push(new Ship(CONST.AVAILABLE_SHIPS[j], this.playerBoard, this.player));
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
                this.playerBoard.updateCell(shipCoords[j].x, shipCoords[j].y, 'ship', this.player);
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
                this.playerBoard.updateCell(shipCoords[j].x, shipCoords[j].y, 'ship', this.player);
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
