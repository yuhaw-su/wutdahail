'use strict';
var Alexa = require("alexa-sdk");
var helper = require('./helper');
var appId = 'amzn1.ask.skill.f609e63d-d852-4a6b-926b-9993ba85db53'; //'amzn1.echo-sdk-ams.app.your-skill-id';

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
        }
        this.handler.state = states.STARTMODE;
        this.emit(':ask', 'Welcome to battle boat, a one-hundred percent original, one-of-a-kind game. '
            + 'Would you like to play?',
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
      var startNumber = helper.moveNumberToYCoordinate(this.event.request.intent.slots.startNumber.value);
      var startLetter = helper.moveLetterToXCoordinate(this.event.request.intent.slots.startLetter.value);
      var endNumber = helper.moveNumberToYCoordinate(this.event.request.intent.slots.endNumber.value);
      var endLetter = helper.moveLetterToXCoordinate(this.event.request.intent.slots.endLetter.value);
      this.emit(':ask', startLetter + " " + startNumber + " to " + endLetter + " " + endNumber, 'hi');
  },
  'AMAZON.HelpIntent': function() {
      var message = 'First, you will place your boats one at a time. Then, you and I will take turns guessing where each ' +
          'others ships are located until one of us sinks all of the others ships. That person will be declared da weiner.';
      this.emit(':ask', message, message);
  },
  'AMAZON.YesIntent': function() {
      this.handler.state = states.GUESSMODE;
      var myBoard = helper.initializeMap();
      var myShipInfo = helper.initializeShipInfo();
      var aiBoard = helper.initializeMap();
      var aiShipInfo = helper.initializeShipInfo();
      this.attributes.me = {
        name : "me",
        board : myBoard,
        shipInfo : myShipInfo
      };
      this.attributes.ai = {
        name : "ai",
        board : aiBoard,
        shipInfo : aiShipInfo
      };
      helper.placeShipsRandomly(this.attributes.me.board, this.attributes.me.shipInfo);
      helper.placeShipsRandomly(this.attributes.ai.board, this.attributes.ai.shipInfo);
      var repeat = 'Make a guess as to where my boats are, for example, a. five';
      var cardTitle = "Your Board";
      var boardDisplay = helper.createBoardDisplayString(this.attributes.me);
      this.emit(':askWithCard', 'Fantastic! I promise I will not cheat. Now lets begin. Its your move, ' + repeat, repeat, cardTitle, boardDisplay);
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
      var rawY = this.event.request.intent.slots.moveLetter.value;
      var rawX = this.event.request.intent.slots.moveNumber.value;
      var y = helper.moveLetterToXCoordinate(rawY);
      var x = helper.moveNumberToYCoordinate(rawX);
      var speechOutput = '';
      var response = 'Guess another spot.';
      if (x < 0 || x >= 9 || y < 0 || y >= 9)
      {
        this.emit(':ask', "That wasn't a valid guess. Try again. Guess another spot.", response + " For example, a. five.");
        return;
      }
      var shootingCode = helper.shoot(x, y, this.attributes.ai);
      switch (shootingCode) {                 // user shoots
        case ShootingCodes.BOAT_ZERO_DOWN:
        case ShootingCodes.BOAT_ONE_DOWN:
        case ShootingCodes.BOAT_TWO_DOWN:
        case ShootingCodes.BOAT_THREE_DOWN:
        case ShootingCodes.BOAT_FOUR_DOWN:
          speechOutput = 'You sank my ' + this.attributes.ai.shipInfo[shootingCode].name + '! ';
          break;
        case ShootingCodes.MISS:
          speechOutput = 'Miss! ';
          break;
        case ShootingCodes.HIT:
          speechOutput = 'Thats a hit! ';
          break;
        case ShootingCodes.ALREADY_GUESSED:
          speechOutput = 'You have already guessed that spot. Please guess again, for example, a. five';
          this.emit(':ask', speechOutput, response);
          return;
        case ShootingCodes.I_WON:
          speechOutput = 'Congratulations, you beat me! Ill get you next time!  Would you like to play again? Say yes or no.';
          this.handler.state = states.STARTMODE;
          this.emit(':tell', speechOutput);
          return;
        default:
          speechOutput = 'woah, how did you get here? Just guess again, for example, a. five';
          this.emit(':ask', speechOutput, response);
          return;
      }
      // ai's turn
      var aiSpeechOutput = '';
      shootingCode = ShootingCodes.ALREADY_GUESSED;
      while (shootingCode == ShootingCodes.ALREADY_GUESSED)
      {
        var aiGuess = helper.getAIGuess(this.attributes.me);
        x = aiGuess[0];
        y = aiGuess[1];
        aiSpeechOutput = " My turn. " + helper.xCoordinateToMoveLetter(y) + " " + helper.yCoordinateToMoveNumber(x) + ". ";
        shootingCode = helper.shoot(x, y, this.attributes.me);
        switch (shootingCode) {                 // user shoots
          case ShootingCodes.BOAT_ZERO_DOWN:
          case ShootingCodes.BOAT_ONE_DOWN:
          case ShootingCodes.BOAT_TWO_DOWN:
          case ShootingCodes.BOAT_THREE_DOWN:
          case ShootingCodes.BOAT_FOUR_DOWN:
            aiSpeechOutput += 'I sank your ' + this.attributes.ai.shipInfo[shootingCode].name + '! ';
            break;
          case ShootingCodes.MISS:
            aiSpeechOutput += 'I missed. Darn. ';
            break;
          case ShootingCodes.HIT:
            aiSpeechOutput += 'I got a hit! ';
            break;
          case ShootingCodes.ALREADY_GUESSED:
            break;
          case ShootingCodes.AI_WON:
            aiSpeechOutput += 'Haha, I won. Better luck next time! Would you like to play again? Say yes or no.';
            this.handler.state = states.STARTMODE;
            this.emit(':tell', speechOutput + aiSpeechOutput);
            return;
          default:
            aiSpeechOutput = 'woah, how did you get here? Just guess again.';
            this.emit(':ask', aiSpeechOutput, response);
            return;
        }
      }
      var gridString = helper.createBoardDisplayString(this.attributes.ai);
      this.emit(':askWithCard', speechOutput + aiSpeechOutput + response, response + "for example, a. five.", "It's youre move!", gridString);
    },
    'AMAZON.HelpIntent': function() {
        this.emit(':ask', 'Refer to the Alexa app to see all of your guesses.' +
            ' Guess now, for example, a. five', 'Guess now, for example, a. five');
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
};
