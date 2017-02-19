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
  if ((direction == DirectionCodes.DOWN && (startX+shipLength) >= 10) || (direction == DirectionCodes.RIGHT && (startY+shipLength) >= 10))
    return false;
  for (var i = 0; i < shipLength; i++)
  {
    if (direction == DirectionCodes.DOWN && map[startX+i][startY] == 1)
      return false;
    else if (map[startX][startY+i] == 1)
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

function placeBoat (x, y, direction, player, shipIndex)
{
  player.shipInfo[shipIndex].startX = x;
  player.shipInfo[shipIndex].startY = y;
  player.shipInfo[shipIndex].direction = direction;
  for (var j = 0; j < player.shipInfo[shipIndex].size; j++)
  {
    if (direction == DirectionCodes.RIGHT) //horizontal
    {
      player.board[x][y+j] = 1;
    }
    else
    {
      player.board[x+j][y] = 1;
    }
  }
  player.shipsEntered++;
}

function huntMode (x, y, me) {
  // puts stuff in queue (only if the AI hits something)
  if(me.board[x][y] === ShootingCodes.UG_HIT) {
    if(x >= 1 && (me.board[x - 1][y] === 0 || me.board[x - 1][y] === 1)){
        me.aiGuessQueue.push([x - 1,y]);
    }
    // below
    if(x < 9 && (me.board[x + 1][y] === 0 || me.board[x + 1][y] === 1)){
        me.aiGuessQueue.push([x + 1, y]);
    }
    //left
    if(y >= 1 && (me.board[x][y - 1] === 0 || me.board[x][y - 1] === 1)){
        me.aiGuessQueue.push([x, y - 1]);
    }
    // down
    if(y < 9 && (me.board[x][y + 1] === 0 || me.board[x][y + 1] === 1)){
        me.aiGuessQueue.push([x, y + 1]);
    }
    return false;
  }
  else {
    return true;
  }
}

function targetMode (me) {
  // checks if the queue is empty
  if(me.aiGuessQueue.length === 0) {
    return false;
  } else {
    return true;
  }
}


var helper = (function () {
  return {
    moveLetterToXCoordinate : function (letter) {
      switch (letter.toLowerCase()) {
        case "alpha":
          return 0;
        case "bravo":
          return 1;
        case "charlie":
          return 2;
        case "delta":
          return 3;
        case "echo":
          return 4;
        case "foxtrot":
          return 5;
        case "golf":
          return 6;
        case "hotel":
          return 7;
        case "india":
          return 8;
        case "juliette":
          return 9;
        default:
          return -1;
      }
    },

    xCoordinateToMoveLetter : function (y) {
      switch (y) {
        case 0:
          return "alpha";
        case 1:
          return "beta";
        case 2:
          return "charlie";
        case 3:
          return "delta";
        case 4:
          return "echo";
        case 5:
          return "foxtrot";
        case 6:
          return "golf";
        case 7:
          return "hotel";
        case 8:
          return "india";
        case 9:
          return "juliette";
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

    placeShipsRandomly : function(player) {
    	for (var i = 0; i < player.shipInfo.length; i++)
      {
    		var illegalPlacement = true;
    		while (illegalPlacement)
        {
    			var randomX = Math.floor(10*Math.random());
    			var randomY = Math.floor(10*Math.random());
    			var randomDirection = Math.floor(2*Math.random()) == 0 ? DirectionCodes.RIGHT : DirectionCodes.DOWN;
    			if (isLegalPlacement(player.board, randomX, randomY, randomDirection, player.shipInfo[i].size))
          {
            placeBoat(randomX, randomY, randomDirection, player, i);
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
            if (hitBoatIndex == -1)
              return ShootingCodes.MISS;
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

      if(huntMode(randomX, randomY, me)) {
        return [randomX, randomY];
      } else if (targetMode()) {
        var popedFromQueue = me.aiGuessQueue.shift();
        return [popedFromQueue[0], popedFromQueue[1]];
      }
    },

    createBoardDisplayString : function (player) {
      var output = '----A---B--C---D---E---F--G---H---I---J\n';
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
                output += '🚢';
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
    },

    isLegalPlacement : function (x, y, direction, map, size)
    {
      return isLegalPlacement(map, x, y, direction, size);
    },

    placeBoat : function (x, y, direction, player, index)
    {
      return placeBoat(x, y, direction, player, index);
    }
  };
})();
module.exports = helper;
