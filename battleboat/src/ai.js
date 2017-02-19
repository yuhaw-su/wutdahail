/**
 * Created by Kevin on 2/18/2017.
 */

//=================//
//      AI         //
//=================//
// Randomly guess
var HUNT_MODE = 0;
// Search adjacent cells
var TARGET_MODE = 1;

// Constructor
function AI(gameObject) {
    this.gameObject = gameObject;
    this.virtualGrid = new Board(Game.size);
    this.virtualFleet = new Fleet(this.virtualGrid, CONST.VIRTUAL_PLAYER);
    this.mode = HUNT_MODE;
}

AI.prototype.shoot = function() {

    if(this.mode === HUNT_MODE){
        var result = this.randomlyShoot();
    }
    else if(this.mode === TARGET_MODE){

    }
};

AI.prototype.randomlyShoot = function() {
    var x = getRandom(0,9);
    var y = getRandom(0,9);
    var result = this.gameObject.shoot(x, y, CONST.HUMAN_PLAYER);

    // If the game ends, the next lines need to be skipped.
    if (Game.gameOver) {
        Game.gameOver = false;
        return;
    }

    this.virtualGrid.cells[x][y] = result;

    // If you hit a ship, check to make sure if you've sunk it.
    if (result === CONST.TYPE_HIT) {
        var humanShip = this.findHumanShip(x, y);
        if (humanShip.isSunk()) {
            // Remove any ships from the roster that have been sunk
            var shipTypes = [];
            for (var k = 0; k < this.virtualFleet.fleetRoster.length; k++) {
                shipTypes.push(this.virtualFleet.fleetRoster[k].type);
            }
            var index = shipTypes.indexOf(humanShip.type);
            this.virtualFleet.fleetRoster.splice(index, 1);

            // Update the virtual grid with the sunk ship's cells
            var shipCells = humanShip.getAllShipCells();
            for (var _i = 0; _i < shipCells.length; _i++) {
                this.virtualGrid.cells[shipCells[_i].x][shipCells[_i].y] = CONST.TYPE_SUNK;
            }
        }
    }
};

// Finds a human ship by coordinates
// Returns Ship
AI.prototype.findHumanShip = function(x, y) {
    return this.gameObject.humanFleet.findShipByCoords(x, y);
};