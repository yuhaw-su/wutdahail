'use strict';

function isLegalPlacement (map, startX, startY, direction, shipLength) {
  if ((direction == 0 && (startY+shipLength) >= 10) || (direction == 1 && (startX+shipLength) >= 10))
    return false;
  for (var i = 0; i < shipLength; i++)
  {
    if (direction == 0 && map[startX][startY+i] == 1)
      return false;
    else if (map[startX+i][startY] == 1)
      return false;
  }
  return true;
};

var helper = (function () {
  return {
    moveLetterToYCoordinate : function (letter) {
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

    yCoordinateToMoveLetter : function (y) {
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

    moveNumberToXCoordinate : function (num) {
      var intValue = parseInt(num,10);
      if (intValue >= 1 && intValue <= 10)
        return intValue - 1;
      else
        return -1;
    },

    xCoordinateToMoveNumber : function (x) {
      return x + 1;
    },

    isLegalPlacement : function (map, startX, startY, direction, shipLength) {
      if ((direction == 0 && (startY+shipLength) >= 10) || (direction == 1 && (startX+shipLength) >= 10))
        return false;
      for (var i = 0; i < shipLength; i++)
      {
        if (direction == 0 && map[startX][startY+i] == 1)
          return false;
        else if (map[startX+i][startY] == 1)
          return false;
      }
      return true;
    },

    placeShipsRandomly : function(map, shipInfo) {
    	for (var i = 0; i < shipInfo.length; i++)
      {
    		var illegalPlacement = true;
    		while (illegalPlacement)
        {
    			var randomX = Math.floor(10*Math.random());
    			var randomY = Math.floor(10*Math.random());
    			var randomDirection = Math.floor(2*Math.random());
    			if (isLegalPlacement(map, randomX, randomY, randomDirection, shipInfo[i].size))
          {
            shipInfo[i].startX = randomX;
            shipInfo[i].startY = randomY;
            shipInfo[i].direction = randomDirection;
    				for (var j = 0; j < shipInfo[i].size; j++)
            {
              if (randomDirection == 0) //horizontal
              {
                map[randomX][randomY+j] = 1;
              }
              else
              {
                map[randomX+j][randomY] = 1;
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
      var names = ['big big boat', 'big boat', 'boaty McBoat face', 'boat', 'a small yet strong boat'];
      var sizes = [5, 4, 3, 3, 2];
      for (var i = 0; i < names.length; i++)
      {
        shipInfo.push({
          name : names[i],
          size : sizes[i],
          startX : -1,
          startY : -1,
          direction : -1
        });
      }
      return shipInfo;
    },

    createBoardDisplayString : function (map) {
      var output = '';
      for (var i = 0; i < map.length; i++)
      {
        for (var j = 0; j < map[i].length; j++)
        {
          var placeValue = map[i][j];
          switch (placeValue) {
            case 0:
              output += '0';
              break;
            case 1:
              output += '1';
              break;
            case 2:
              output += '2';
              break;
            case 3:
              output += '3';
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
