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

    this.previousShotX = 0;
    this.previousShotY = 0;
    this.queueX = [];
    this.queueY = [];
}

AI.prototype.shoot = function() {

    if(this.mode === HUNT_MODE){
        var result = this.randomlyShoot();
    }
    else if(this.mode === TARGET_MODE){
        var result = this.targetSurroundingsShoot();
    }
};

AI.prototype.randomlyShoot = function() {
    var x = getRandom(0,9);
    var y = getRandom(0,9);

    this.allKindsOfShoot(x, y);
};

AI.prototype.allKindsOfShoot = function (x, y) {
  this.previousShotX = x;
  this.previousShotY = y;

  var result = this.gameObject.shoot(x, y, CONST.HUMAN_PLAYER);

  // If the game ends, the next lines need to be skipped.
  if (Game.gameOver) {
      Game.gameOver = false;
      return;
  }

  this.virtualGrid.cells[x][y] = result;

  // If you hit a ship, check to make sure if you've sunk it.
  if (result === CONST.TYPE_HIT) {
      this.mode = TARGET_MODE;
      this.lastShotWasOn();
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
}

AI.prototype.targetSurroundingsShoot = function() {
  // keeps popping from queue, if on then run lastShotWasOn() again.
  var tempX = this.queueX.shift();
  var tempY = this.queueY.shift();
  this.allKindsOfShoot(tempX, tempY);

  // check if queue is empty, if empty exit TARGET_MODE
  if(queueX.length === 0 || queueY.length === 0) {
    this.mode = HUNT_MODE;
  }
};

AI.prototype.lastShotWasOn = function() {
  // check surroundings make sure it's in bound
  // if the neighbors haven't been visited, push to queue
  var tempXX = this.previousShotX;
  var tempYY = this.previousShotY;
  // above
  if(tempXX >= 1 
    && (this.gameObject.humanBoard[tempXX - 1][tempYY] === 0
    || this.gameObject.humanBoard[tempXX - 1][tempYY] === 1)){
      this.queueX.push(tempXX - 1);
      this.queueY.push(tempYY);
  }
  // below
  if(tempXX < 9
    && (this.gameObject.humanBoard[tempXX + 1][tempYY] === 0
    || this.gameObject.humanBoard[tempXX + 1][tempYY] === 1)){
      this.queueX.push(tempXX + 1);
      this.queueY.push(tempYY);
  }
  //left
  if(tempYY >= 1
    && (this.gameObject.humanBoard[tempXX][tempYY - 1] === 0
    || this.gameObject.humanBoard[tempXX][tempYY - 1] === 1)){
      this.queueX.push(tempXX);
      this.queueY.push(tempYY - 1);
  }
  if(tempYY < 9
    && (this.gameObject.humanBoard[tempXX][tempYY + 1] === 0
    || this.gameObject.humanBoard[tempXX][tempYY + 1] === 1)){
      this.queueX.push(tempXX);
      this.queueY.push(tempYY + 1);
  }
};

// Finds a human ship by coordinates
// Returns Ship
AI.prototype.findHumanShip = function(x, y) {
    return this.gameObject.humanFleet.findShipByCoords(x, y);
};
