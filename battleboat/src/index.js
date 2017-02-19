'use strict';
var Alexa = require("alexa-sdk");
var helper = require('./helper');
var appId = 'amzn1.ask.skill.f609e63d-d852-4a6b-926b-9993ba85db53'; //'amzn1.echo-sdk-ams.app.your-skill-id';

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    // alexa.dynamoDBTableName = 'highLowGuessUsers';
    alexa.registerHandlers(newSessionHandlers, guessModeHandlers, startGameHandlers, placeBoatModeHandlers, guessAttemptHandlers);
    alexa.execute();
};

var states = {
    GUESSMODE: '_GUESSMODE', // User is trying to guess the number.
    PLACEMODE: '_PLACEMODE',
    STARTMODE: '_STARTMODE' // Prompt the user to start or restart the game.
};

var newSessionHandlers = {
    'NewSession': function() {
        if(Object.keys(this.attributes).length === 0) {
            this.attributes.endedSessionCount = 0;
            this.attributes.gamesPlayed = 0;
        }
        this.handler.state = states.STARTMODE;
        this.emit(':ask', 'Welcome to battle boat, a one-hundred percent original, one-of-a-kind game. You have played '
            + this.attributes.gamesPlayed.toString() + ' times. would you like to play?',
            'Say yes to start the game or no to quit.');
    },
    "AMAZON.StopIntent": function() {
      this.emit(':tell', "Goodbye!");
    },
    "AMAZON.CancelIntent": function() {
      this.emit(':tell', "Goodbye!");
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        //this.attributes['endedSessionCount'] += 1;
        this.emit(":tell", "Goodbye!");
    }
};

var startGameHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'AMAZON.HelpIntent': function() {
        var message = 'First, you will place your boats one at a time. Then, you and I will take turns guessing where each ' +
            'others ships are located until one of us sinks all of the others ships. That person will be declared da weiner.';
        this.emit(':ask', message, message);
    },
    'AMAZON.YesIntent': function() {
        this.attributes.guessNumber = Math.floor(Math.random() * 100);
        this.handler.state = states.PLACEMODE;
        var repeat = 'Would you like me to randomly assign your boats locations? Say yes or no.';
        this.emit(':ask', 'Great! Lets begin by placing your boats. ' + repeat, repeat);
    },
    'AMAZON.NoIntent': function() {
        console.log("NOINTENT");
        this.emit(':tell', 'Ok, see you next time!');
    },
    "AMAZON.StopIntent": function() {
      console.log("STOPINTENT");
      this.emit(':tell', "Goodbye!");
    },
    "AMAZON.CancelIntent": function() {
      console.log("CANCELINTENT");
      this.emit(':tell', "Goodbye!");
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        //this.attributes['endedSessionCount'] += 1;
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        var message = 'Say yes to continue, or no to end the game.';
        this.emit(':ask', message, message);
    }
});

var placeBoatModeHandlers = Alexa.CreateStateHandler(states.PLACEMODE, {
  'NewSession': function () {
      this.handler.state = '';
      this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
  },
  'PlaceBoatIntent': function () {
      var startNumber = helper.moveNumberToXCoordinate(this.event.request.intent.slots.startNumber.value);
      var startLetter = helper.moveLetterToYCoordinate(this.event.request.intent.slots.startLetter.value);
      var endNumber = helper.moveNumberToXCoordinate(this.event.request.intent.slots.endNumber.value);
      var endLetter = helper.moveLetterToYCoordinate(this.event.request.intent.slots.endLetter.value);
      this.emit(':ask', startLetter + " " + startNumber + " to " + endLetter + " " + endNumber, 'hi');
  },
  'AMAZON.HelpIntent': function() {
      var message = 'First, you will place your boats one at a time. Then, you and I will take turns guessing where each ' +
          'others ships are located until one of us sinks all of the others ships. That person will be declared da weiner.';
      this.emit(':ask', message, message);
  },
  'AMAZON.YesIntent': function() {
      this.handler.state = states.GUESSMODE;
      this.attributes.myBoard = helper.initializeMap();
      this.attributes.myShipInfo = helper.initializeShipInfo();
      this.attributes.aiBoard = helper.initializeMap();
      this.attributes.aiShipInfo = helper.initializeShipInfo();
      helper.placeShipsRandomly(this.attributes.myBoard, this.attributes.myShipInfo);
      helper.placeShipsRandomly(this.attributes.aiBoard, this.attributes.aiShipInfo);
      var repeat = 'Make a guess as to where my boats are, for example, a. five';
      var cardTitle = "Your Board";
      var boardDisplay = helper.createBoardDisplayString(this.attributes.aiBoard);
      this.emit(':askWithCard', 'Fantastic! I promise I wont cheat. Now lets begin. Its your move, ' + repeat, repeat, cardTitle, boardDisplay);
  },
  'AMAZON.NoIntent': function() {
      console.log("NOINTENT");
      this.emit(':tell', 'Ok, see you next time!');
  },
  "AMAZON.StopIntent": function() {
    console.log("STOPINTENT");
    this.emit(':tell', "Goodbye!");
  },
  "AMAZON.CancelIntent": function() {
    console.log("CANCELINTENT");
    this.emit(':tell', "Goodbye!");
  },
  'SessionEndedRequest': function () {
      console.log("SESSIONENDEDREQUEST");
      //this.attributes['endedSessionCount'] += 1;
      this.emit(':tell', "Goodbye!");
  },
  'Unhandled': function() {
      console.log("UNHANDLED");
      var message = 'Say yes to continue, or no to end the game.';
      this.emit(':ask', message, message);
  }
});

var guessModeHandlers = Alexa.CreateStateHandler(states.GUESSMODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },

    'GuessIntent': function () {
      var x = helper.moveNumberToXCoordinate(this.event.request.intent.slots.moveNumber.value);
      var y = helper.moveLetterToYCoordinate(this.event.request.intent.slots.moveLetter.value);
      var aiBoardValue = this.attributes.aiBoard[x][y];
      var speechOutput = '';
      var response = 'Guess another spot, for example, a. five';
      switch (aiBoardValue)
      {
        case 0:
          speechOutput = 'Aww, you missed.';
          this.attributes.aiBoard[x][y] = 2;
          break;
        case 1:
          speechOutput = 'Hit!';
          this.attributes.aiBoard[x][y] = 3;
          break;
        case 2:
        case 3:
          speechOutput = 'You have already guessed that spot.';
          break;
        default:
          speechOutput = 'Oh no! The skill broke!';
          this.attributes.aiBoard[x][y] = 2;
      }
      this.emit(':ask', 'GuessIntent received');
    },
    'NumberGuessIntent': function() {
        var guessNum = parseInt(this.event.request.intent.slots.number.value);
        var targetNum = this.attributes.guessNumber;
        console.log('user guessed: ' + guessNum);

        if(guessNum > targetNum){
            this.emit('TooHigh', guessNum);
        } else if( guessNum < targetNum){
            this.emit('TooLow', guessNum);
        } else if (guessNum === targetNum){
            // With a callback, use the arrow function to preserve the correct 'this' context
            this.emit('JustRight', () => {
                this.emit(':ask', guessNum.toString() + 'is correct! Would you like to play a new game?',
                'Say yes to start a new game, or no to end the game.');
            });
        } else {
            this.emit('NotANum');
        }
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':ask', 'I am thinking of a number between zero and one hundred, try to guess and I will tell you' +
            ' if it is higher or lower.', 'Try saying a number.');
    },
    "AMAZON.StopIntent": function() {
        console.log("STOPINTENT");
      this.emit(':tell', "Goodbye!");
    },
    "AMAZON.CancelIntent": function() {
        console.log("CANCELINTENT");
    },
    'SessionEndedRequest': function () {
        console.log("SESSIONENDEDREQUEST");
        this.attributes.endedSessionCount += 1;
        this.emit(':tell', "Goodbye!");
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
        this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
    }
});

// These handlers are not bound to a state
var guessAttemptHandlers = {
    'TooHigh': function(val) {
        this.emit(':ask', val.toString() + ' is too high.', 'Try saying a smaller number.');
    },
    'TooLow': function(val) {
        this.emit(':ask', val.toString() + ' is too low.', 'Try saying a larger number.');
    },
    'JustRight': function(callback) {
        this.handler.state = states.STARTMODE;
        this.attributes.gamesPlayed++;
        callback();
    },
    'NotANum': function() {
        this.emit(':ask', 'Sorry, I didn\'t get that. Try saying a number.', 'Try saying a number.');
    }
};
