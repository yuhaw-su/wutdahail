'use strict'
function moveLetterToYCoordinate (letter) {
  switch (letter) {
    case "A":
      return 0;
    case "B":
      return 1;
    case "C":
      return 2;
    case "D":
      return 3;
    case "E":
      return 4;
    case "F":
      return 5;
    case "G":
      return 6;
    case "H":
      return 7;
    case "I":
      return 8;
    case "J":
      return 9;
    default:
      return -1;
  }
}

function yCoordinateToMoveLetter (y) {
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
      return "well then...shit"
  }
}

function moveNumberToXCoordinate (num) {
  var intValue = parseInt(num);
  if (intValue >= 1 && intValue <= 10)
    return intValue - 1;
  else {
    return -1;
  }
}

function xCoordinateToMoveNumber (x) {
  return x + 1;
}
