/**
 * Created by Kevin on 2/18/2017.
 */

function Create2DArray(rows) {
    var arr = [];

    for (var i=0;i<rows;i++) {
        arr[i] = [];
    }

    return arr;
}

var board = Create2DArray(10);

function PrintBoard(){
    for(var i=0; i<board.length; i++) {
        for (var j = 0; j < board[i].length; i++) {
            console.log("[?]"+"<br />");
        }
        console.log("<br />")
    }
}
