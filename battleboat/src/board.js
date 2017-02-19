/**
 * Created by Kevin on 2/18/2017.
 */

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
        console.log("There was an error trying to find the correct player's board");
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

// Print Function
Board.prototype.printBoard = function() {
    for (var x = 0; x < this.size; x++) {
        var row = this.cells[x];

        for (var y = 0; y < this.size; y++) {
            document.write(row[y] + " ");

        }

        document.write("<br />");
    }
};