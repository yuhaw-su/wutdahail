'use strict';

var ShootingCodes = {
  ERROR : -1,
  BOAT_ZERO_DOWN : 0,
  BOAT_ONE_DOWN : 1,
  BOAT_TWO_DOWN : 2,
  BOAT_THREE_DOWN : 3,
  BOAT_FOUR_DOWN : 4,
  MISS : 5,
  HIT : 6,
  ALREADY_GUESSED : 7,
  I_WON : 8,
  AI_WON : 9
};

var SpaceCodes = {
  ERROR : -1,
  UG_MISS : 0,
  UG_HIT : 1,
  G_MISS : 2,
  G_HIT : 3
};

var DirectionCodes = {
  RIGHT : 0,
  DOWN : 1
};

function isLegalPlacement (map, startX, startY, direction, shipLength)
{
  if ((direction == DirectionCodes.DOWN && (startY+shipLength) >= 10) || (direction == DirectionCodes.RIGHT && (startX+shipLength) >= 10))
    return false;
  for (var i = 0; i < shipLength; i++)
  {
    if (direction == DirectionCodes.DOWN && map[startY+i][startX] == 1)
      return false;
    else if (map[startY][startX+i] == 1)
      return false;
  }
  return true;
}

function determineWhichBoatWasHit (x, y, hitPlayer)
{
  for (var i = 0; i < hitPlayer.shipInfo.length; i++)
  {
    var boatX = hitPlayer.shipInfo[i].startX;
    var boatY = hitPlayer.shipInfo[i].startY;
    for (var j = 0; j < hitPlayer.shipInfo[i].size; j++)
    {
      if (hitPlayer.shipInfo[i].direction == DirectionCodes.RIGHT && boatX+j == x && boatY == y)
        return i;
      else if (hitPlayer.shipInfo[i].direction == DirectionCodes.DOWN && boatX == x && boatY+j == y)
        return i;
    }
  }
  return -1;
}

function checkIfGameOver (otherPlayer)
{
  for (var i = 0; i < otherPlayer.shipInfo.length; i++)
  {
    if (otherPlayer.shipInfo[i].life > 0)
      return false;
  }
  return true;
}

var helper = (function () {
  return {
    moveLetterToXCoordinate : function (letter) {
      switch (letter[0].toUpperCase()) {
        case "A":
        case "a.":
          return 0;
        case "B":
        case "b.":
          return 1;
        case "C":
        case "c.":
          return 2;
        case "D":
        case "d.":
          return 3;
        case "E":
        case "e.":
          return 4;
        case "F":
        case "f.":
          return 5;
        case "G":
        case "g.":
          return 6;
        case "H":
        case "h.":
          return 7;
        case "I":
        case "i.":
          return 8;
        case "J":
        case "j.":
          return 9;
        default:
          return -1;
      }
    },

    xCoordinateToMoveLetter : function (y) {
      switch (y) {
        case 0:
          return "a.";
        case 1:
          return "b.";
        case 2:
          return "c.";
        case 3:
          return "d.";
        case 4:
          return "e.";
        case 5:
          return "f.";
        case 6:
          return "g.";
        case 7:
          return "h.";
        case 8:
          return "i.";
        case 9:
          return "j.";
        default:
          return "well then...shit";
      }
    },

    moveNumberToYCoordinate : function (num) {
      var intValue = parseInt(num,10);
      return intValue - 1;
    },

    yCoordinateToMoveNumber : function (x) {
      return x + 1;
    },

    placeShipsRandomly : function(map, shipInfo) {
    	for (var i = 0; i < shipInfo.length; i++)
      {
    		var illegalPlacement = true;
    		while (illegalPlacement)
        {
    			var randomX = Math.floor(10*Math.random());
    			var randomY = Math.floor(10*Math.random());
    			var randomDirection = Math.floor(2*Math.random()) == 0 ? DirectionCodes.RIGHT : DirectionCodes.DOWN;
    			if (isLegalPlacement(map, randomX, randomY, randomDirection, shipInfo[i].size))
          {
            shipInfo[i].startX = randomX;
            shipInfo[i].startY = randomY;
            shipInfo[i].direction = randomDirection;
    				for (var j = 0; j < shipInfo[i].size; j++)
            {
              if (randomDirection == DirectionCodes.RIGHT) //horizontal
              {
                map[randomX+j][randomY] = 1;
              }
              else
              {
                map[randomX][randomY+j] = 1;
              }
            }
    				illegalPlacement = false;
    			} else {
    				continue;
    			}
    		}
    	}
    },

    initializeMap : function () {
      var map = [];
      for (var i = 0; i < 10; i++)
      {
        map[i] = [];
        for (var j = 0; j < 10; j++)
        {
          map[i][j] = 0;
        }
      }
      return map;
    },

    initializeShipInfo : function () {
      var shipInfo = [];
      var names = ['big big boat', 'big boat', 'boaty McBoat face', 'boat', 'baby boat'];
      var sizes = [5, 4, 3, 3, 2];
      for (var i = 0; i < names.length; i++)
      {
        shipInfo.push({
          name : names[i],
          size : sizes[i],
          startX : -1,
          startY : -1,
          direction : -1,
          life : sizes[i]
        });
      }
      return shipInfo;
    },

    shoot : function (x, y, targetPlayer) {
        // If they try to shoot somewhere they have already hit a ship
        switch (targetPlayer.board[x][y])
        {
          case SpaceCodes.UG_MISS:
            targetPlayer.board[x][y] = 2;
            return ShootingCodes.MISS;
          case SpaceCodes.UG_HIT:
            targetPlayer.board[x][y] = 3;
            var hitBoatIndex = determineWhichBoatWasHit(x, y, targetPlayer);
            console.log(hitBoatIndex);
            targetPlayer.shipInfo[hitBoatIndex].life = targetPlayer.shipInfo[hitBoatIndex].life - 1;
            if (targetPlayer.shipInfo[hitBoatIndex].life == 0)
            {
              if (checkIfGameOver(targetPlayer))
              {
                return targetPlayer.name == 'me' ? ShootingCodes.I_WON : ShootingCodes.AI_WON;
              }
              return hitBoatIndex;
            }
            return ShootingCodes.HIT;
          case SpaceCodes.G_MISS:
          case SpaceCodes.G_HIT:
            return ShootingCodes.ALREADY_GUESSED;
          default:
            return ShootingCodes.ERROR; //?
        }
    },

    getAIGuess : function (me) {
      var randomX = Math.floor(10*Math.random());
      var randomY = Math.floor(10*Math.random());
      return [randomX, randomY];
    },

    createBoardDisplayString : function (player) {
      var output = '----A---B---C--D---E---F--G---H---I---J\n';
      for (var i = 0; i < player.board.length; i++)
      {
        output += (i+1).toString() + "-";
        if (i != 9) output += "-";
        for (var j = 0; j < player.board[i].length; j++)
        {
          var placeValue = player.board[i][j];
          switch (placeValue) {
            case 0:
              output += '⬜️';
              break;
            case 1:
              if (player.name == "ai")
                output += '⬜️';
              else
                output += '🚢'
              break;
            case 2:
              output += '💧';
              break;
            case 3:
              if (player.name == "ai")
                output += '💥';
              else
                output += '🚢';
              break;
            default:
              output += 'fuck';
          }
          output += ' ';
        }
        output += '\n';
      }
      return output;
    }
  };
})();
module.exports = helper;
