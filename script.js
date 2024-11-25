// ----------------------------------------
// Global variables
// ----------------------------------------

const cpuMoveDelay = 1000;

// keep track of current state:
// - who is each player
// - whose turn is it
// - what pieces have been played in which spaces

var gameState = null;
var gameStateReset = {
  playerX: { mark: "", name: "", shortname: "" },
  playerO: { mark: "", name: "", shortname: "" },
  isMultiplayer: true,
  whoseTurn: "",
  isCPUTurn: false,
  gameboard: {
    r1c1: "",
    r1c2: "",
    r1c3: "",
    r2c1: "",
    r2c2: "",
    r2c3: "",
    r3c1: "",
    r3c2: "",
    r3c3: "",
  },
  isGameOver: false,
  isTied: false,
  isWinner: false,
  winner: {
    mark: "",
    startingSpace: "",
    direction: "",
  },
  history: {
    winsPlayerX: 0,
    winsPlayerO: 0,
    ties: 0,
  },
};

const gamePieceIcons = {
  x: {
    classNames: ["icon", "icon--x", "icon--filled", "icon--animated"],
    svgId: "#icon-x",
  },
  o: {
    classNames: ["icon", "icon--o", "icon--filled", "icon--animated"],
    svgId: "#icon-o",
  },
  "x-outline": {
    classNames: ["icon", "icon--x", "icon--outline"],
    svgId: "#icon-x-outline",
  },
  "o-outline": {
    classNames: ["icon", "icon--o", "icon--outline"],
    svgId: "#icon-o-outline",
  },
};

// ----------------------------------------
// Local storage
// ----------------------------------------

// To reset (clear) ALL of the local storage;
// not just contents set by this website
// localStorage.clear();

const storageKey = "tic-tac-toe-game";

// General utility functions

const isLocalStoragePermitted = () => {
  return "localStorage" in window && window["localStorage"] !== null;
};

const getLocalStorageValue = (storageKey) => {
  return JSON.parse(localStorage.getItem(storageKey));
};

const setLocalStorageValue = (value, storageKey) => {
  localStorage.setItem(storageKey, JSON.stringify(value));
};

const clearLocalStorageValue = (storageKey) => {
  localStorage.removeItem(storageKey);
};

// Application specific functions (Tic Tac Toe game state)

const clearGameState = () => {
  clearLocalStorageValue(storageKey);
  gameState = null;
};

const createNewGameState = () => {
  // (Deep) copy a new game state reset object to start over
  gameState = JSON.parse(JSON.stringify(gameStateReset));
};

const loadExistingGameState = () => {
  const existingGameState = getLocalStorageValue(storageKey);

  // If not local storagae game state exists, then return
  if (!existingGameState) return null;

  // Otherwise, read that existing game state in
  renderExistingGame(existingGameState);
};

// ----------------------------------------
// HTML elements to save
// ----------------------------------------

// Main sections
const mainMenu = document.getElementById("main-menu");
const gameboard = document.getElementById("active-gameboard");

// Dialogs
const resultsDialog = document.getElementById("results-dialog");
const restartDialog = document.getElementById("restart-dialog");

// Buttons
const newGameVsCPUButton = document.getElementById("new-game-vs-cpu-button");
const newGameVsPlayerButton = document.getElementById(
  "new-game-vs-player-button"
);
const restartGameButton = document.getElementById("restart-game");
const yesRestartGameButton = document.getElementById("restart-game-yes");
const quitButton = document.getElementById("quit");
const nextRoundButton = document.getElementById("next-round");

// Gameboard key elements
const gameboardTurn = document.getElementById("gameboard-turn");
const gameboardSpaces = document.querySelectorAll(".gameboard-space");

// Scoreboard key elements
const scoreboardPlayerXName = document.getElementById("shortname-player-x");
const scoreboardPlayerOName = document.getElementById("shortname-player-o");
const scoreboardPlayerXWins = document.getElementById("wins-player-x");
const scoreboardPlayerOWins = document.getElementById("wins-player-o");
const scoreboardTies = document.getElementById("ties-count");

// ----------------------------------------
// CPU player functions
// ----------------------------------------

const findWinningMoves = () => {
  return -1;
};

const cpuMark = () => {
  // If multiplayer game, then CPU not involved, so return
  if (gameState.isMultiplayer) return null;
  // If CPU is X and it's not X's turn, then return
  if (gameState.playerX.name === "CPU") return "x";
  // If CPU is O and it's not O's turn, then return
  if (gameState.playerO.name === "CPU") return "o";
  return null;
};

const cpuMakeMove = () => {
  // If multiplayer game, then CPU not involved, so return
  if (gameState.isMultiplayer) return;
  // If CPU is X and it's not X's turn, then return
  if (gameState.playerX.name === "CPU" && gameState.whoseTurn !== "x") return;
  // If CPU is O and it's not O's turn, then return
  if (gameState.playerO.name === "CPU" && gameState.whoseTurn !== "o") return;

  // Update game state to indicate it is the CPU's turn
  gameState.isCPUTurn = true;

  // Find the next space to play
  fc = 0;
  const minimaxResult = minimax({ ...gameState.gameboard }, cpuMark());

  // Choose randomly among the remaining available spaces
  const chosenSpaceId = minimaxResult.index;

  // Build in a delay for the CPU's turn (for dramatic effect)
  setTimeout(() => {
    // Place appropriate mark (in its final form)
    const chosenSpace = getGameboardSpaceFromId(chosenSpaceId);
    chosenSpace.appendChild(createGameboardPiece(gameState.whoseTurn));

    // Update the game state
    recordMove(chosenSpaceId);

    // Update game state to indicate the CPU's turn is complete
    gameState.isCPUTurn = false;

    // If game is ended, then stop game and render results
    if (renderEndGame()) return;

    // If game still going, then update whose turn it is
    gameboardTurn.dataset.turn = gameState.whoseTurn;

    // Save state to local storage
    setLocalStorageValue(gameState, storageKey);
  }, cpuMoveDelay);
};

// ----------------------------------------
// Game state functions
// ----------------------------------------

const startNewGame = (playerX, playerO) => {
  // Save the new game player information to the game state
  gameState.playerX = playerX;
  gameState.playerO = playerO;

  gameState.isMultiplayer =
    gameState.playerX.name !== "CPU" && gameState.playerO.name !== "CPU";

  // Clear the gameboard
  Object.keys(gameState.gameboard).forEach(
    (key) => (gameState.gameboard[key] = "")
  );

  // Clear the results
  gameState.isGameOver = false;
  gameState.isTied = false;
  gameState.isWinner = false;
  Object.keys(gameState.winner).forEach((key) => (gameState.winner[key] = ""));

  // Set whose turn to "x"
  gameState.whoseTurn = "x";
};

const recordMove = (spaceId) => {
  gameState.gameboard[spaceId] = gameState.whoseTurn;

  // Check if new move results in a winner
  const winnerInfo = findWinner();
  if (winnerInfo) {
    // Update game state with the winner information
    gameState.isGameOver = true;
    gameState.isWinner = true;
    gameState.winner = winnerInfo;
    return;
  }

  // Check if new move results in a tie
  if (isTied()) {
    // Update game state with the tie state
    gameState.isGameOver = true;
    gameState.isTied = true;
    return;
  }

  // If no winner or tie, then update whose turn it is
  gameState.whoseTurn = gameState.whoseTurn === "x" ? "o" : "x";
};

const findWinner = () => {
  // Check diagonals
  if (isWinnerInDiagonal(1)) {
    return {
      mark: gameState.gameboard.r1c1,
      startingSpace: "r1c1",
      direction: "diagonal",
    };
  }
  if (isWinnerInDiagonal(3)) {
    return {
      mark: gameState.gameboard.r3c1,
      startingSpace: "r3c1",
      direction: "diagonal",
    };
  }

  // Check rows
  if (isWinnerInRow(1)) {
    return {
      mark: gameState.gameboard.r1c1,
      startingSpace: "r1c1",
      direction: "row",
    };
  }
  if (isWinnerInRow(2)) {
    return {
      mark: gameState.gameboard.r2c1,
      startingSpace: "r2c1",
      direction: "row",
    };
  }
  if (isWinnerInRow(3)) {
    return {
      mark: gameState.gameboard.r3c1,
      startingSpace: "r3c1",
      direction: "row",
    };
  }

  // Check columns
  if (isWinnerInColumn(1)) {
    return {
      mark: gameState.gameboard.r1c1,
      startingSpace: "r1c1",
      direction: "column",
    };
  }
  if (isWinnerInColumn(2)) {
    return {
      mark: gameState.gameboard.r1c2,
      startingSpace: "r1c2",
      direction: "column",
    };
  }
  if (isWinnerInColumn(3)) {
    return {
      mark: gameState.gameboard.r1c3,
      startingSpace: "r1c3",
      direction: "column",
    };
  }

  return false;
};

const getSpacesInRow = (row = 1) => {
  return Object.fromEntries(
    Object.entries(gameState.gameboard).filter(([k]) =>
      [`r${row}c1`, `r${row}c2`, `r${row}c3`].includes(k)
    )
  );
};

const getSpacesInColumn = (column = 1) => {
  return Object.fromEntries(
    Object.entries(gameState.gameboard).filter(([k]) =>
      [`r1c${column}`, `r2c${column}`, `r3c${column}`].includes(k)
    )
  );
};

const getSpacesInDiagonal = (diagonal = 1) => {
  return Object.fromEntries(
    Object.entries(gameState.gameboard).filter(([k]) =>
      [`r${diagonal}c1`, `r2c2`, `r${diagonal === 1 ? 3 : 1}c3`].includes(k)
    )
  );
};

const getSurroundingSpaces = (gameboard, spaceId, direction) => {
  const row = spaceId.charAt(1);
  if (direction === "row")
    return Object.fromEntries(
      Object.entries(gameboard).filter(([k]) =>
        [`r${row}c1`, `r${row}c2`, `r${row}c3`].includes(k)
      )
    );

  const column = spaceId.charAt(3);
  if (direction === "column")
    return Object.fromEntries(
      Object.entries(gameboard).filter(([k]) =>
        [`r1c${column}`, `r2c${column}`, `r3c${column}`].includes(k)
      )
    );

  let diagonal;
  switch (spaceId) {
    case "r1c1":
    case "r2c2":
    case "r3c3":
      diagonal = 1;
      break;
    case "r1c3":
    case "r3c1":
      diagonal = 3;
      break;
    default:
      return null;
      break;
  }

  if (direction === "diagonal")
    return Object.fromEntries(
      Object.entries(gameboard).filter(([k]) =>
        [`r${diagonal}c1`, `r2c2`, `r${diagonal === 1 ? 3 : 1}c3`].includes(k)
      )
    );

  return null;
};

const calculateSpacesWinPotential = (spaces) => {
  // Map marks of "", "x", and "o" to points
  // Every "x" is +1 points
  // Every "" is 0 points
  // Every "o" is -1 points
  return Object.values(spaces)
    .map((mark) => {
      if (mark === "x") return 1;
      if (mark === "o") return -1;
      return 0;
    })
    .reduce((totalScore, spaceScore) => totalScore + spaceScore, 0);

  // 3 spaces occupied
  // if three "x", then score = 3
  // if three "o", then score = -3

  // if two "x" & one "", then score = 2
  // if one "x" & two "", then score = 1
  // if three "", then score = 0
  // if one "o" & two "", then score = -1
  // if two "o" & one "", then score = -2

  // if one "" & one of "x" & one of "o", then score = (0?)
};

const winOptions = {
  row1: { type: "row", startLocation: "r1c1" },
  row2: { type: "row", startLocation: "r2c1" },
  row3: { type: "row", startLocation: "r3c1" },
  col1: { type: "column", startLocation: "r1c1" },
  col2: { type: "column", startLocation: "r1c2" },
  col3: { type: "column", startLocation: "r1c3" },
  diag1: { type: "diagonal", startLocation: "r1c1" },
  diag3: { type: "diagonal", startLocation: "r1c3" },
};

const isMarkAWinnerInTrio = (trio, mark = "x") => {
  return Object.values(trio).every((el) => el === mark);
};

const findMarkWinningTrios = (gameboard, mark) => {
  return Object.entries(winOptions).filter(([key, value]) =>
    isMarkAWinnerInTrio(
      getSurroundingSpaces(gameboard, value.startLocation, value.type),
      mark
    )
  );
};

const isMarkAWinner = (gameboard = gameState.gameboard, mark = "x") => {
  if (isTied(gameboard)) return false;

  // Check each of the win options
  // if any are winners, then return true
  return findMarkWinningTrios(gameboard, mark).length > 0;
};

const cpuGameStateEvaluation = {
  row1: { type: "row", startLocation: "r1c1", winPotential: 0 },
  row2: { type: "row", startLocation: "r2c1", winPotential: 0 },
  row3: { type: "row", startLocation: "r3c1", winPotential: 0 },
  col1: { type: "column", startLocation: "r1c1", winPotential: 0 },
  col2: { type: "column", startLocation: "r1c2", winPotential: 0 },
  col3: { type: "column", startLocation: "r1c3", winPotential: 0 },
  diag1: { type: "diagonal", startLocation: "r1c1", winPotential: 0 },
  diag3: { type: "diagonal", startLocation: "r1c3", winPotential: 0 },
};

// to keep count of function calls
var fc = 0;

const minimax = (gameboard, mark = "x") => {
  fc++;
  var availableSpaces = findAvailableSpaces(gameboard);

  // checks for terminal states => win, lose, or tie
  // return a value accordingly
  if (isMarkAWinner(gameboard, cpuMark())) {
    return { score: 10 };
  } else if (isMarkAWinner(gameboard, cpuMark() === "x" ? "o" : "x")) {
    return { score: -10 };
  } else if (availableSpaces.length === 0) {
    return { score: 0 };
  }

  // an array to collect all the objects
  var moves = [];

  // loop through available spots
  for (var i = 0; i < availableSpaces.length; i++) {
    //create an object for each and store the index of that spot that was stored as a number in the object's index key
    var move = {};
    move.index = availableSpaces[i];
    //move.score = 0;

    // set the empty spot to the current player
    gameboard[availableSpaces[i]] = mark;

    // collect the score resulting from calling minimax on the opponent of the current player
    var result = minimax(gameboard, mark === "x" ? "o" : "x");
    move.score = result.score;
    /* if (mark === cpuMark()) {
      var result = minimax(gameboard, huPlayer);
      move.score = result.score;
    } else {
      var result = minimax(gameboard, aiPlayer);
      move.score = result.score;
    } */

    //reset the spot to empty
    gameboard[availableSpaces[i]] = "";

    // push the object to the array
    moves.push(move);
  }

  var bestMove;
  var bestScore;

  if (mark === cpuMark()) {
    // if it is the CPU's turn loop over the moves and choose the move with the highest score
    bestScore = -10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    // else it's the human's turn, so loop over the moves and choose the move with the lowest score
    bestScore = 10000;
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  // return the chosen move (object) from the array to the higher depth
  return moves[bestMove];
};

const isWinnerInRow = (row = 1) => {
  return (
    gameState.gameboard[`r${row}c1`] !== "" &&
    gameState.gameboard[`r${row}c1`] === gameState.gameboard[`r${row}c2`] &&
    gameState.gameboard[`r${row}c1`] === gameState.gameboard[`r${row}c3`]
  );
};

const isWinnerInColumn = (column = 1) => {
  return (
    gameState.gameboard[`r1c${column}`] !== "" &&
    gameState.gameboard[`r1c${column}`] ===
      gameState.gameboard[`r2c${column}`] &&
    gameState.gameboard[`r1c${column}`] === gameState.gameboard[`r3c${column}`]
  );
};

const isWinnerInDiagonal = (diagonal = 1) => {
  // diagonal == 1 ? r1c1 + r2c2 + r3c3
  // diagonal == 3 ? r3c1 + r2c2 + r1c3
  return (
    gameState.gameboard[`r${diagonal}c1`] !== "" &&
    gameState.gameboard[`r${diagonal}c1`] === gameState.gameboard[`r2c2`] &&
    gameState.gameboard[`r${diagonal}c1`] ===
      gameState.gameboard[`r${diagonal === 1 ? 3 : 1}c3`]
  );
};

const isWinner = () => {
  return (
    isWinnerInDiagonal(1) ||
    isWinnerInDiagonal(3) ||
    isWinnerInRow(1) ||
    isWinnerInRow(2) ||
    isWinnerInRow(3) ||
    isWinnerInColumn(1) ||
    isWinnerInColumn(2) ||
    isWinnerInColumn(3)
  );
};

const isTied = (gameboard = gameState.gameboard) => {
  // Check if any blank spaces remaining on the gameboard
  //return Object.values(gameState.gameboard).indexOf("") == -1;
  return findAvailableSpaces(gameboard).length === 0;
};

const findAvailableSpaces = (gameboard = gameState.gameboard) => {
  return Object.keys(gameboard).filter((key) => gameboard[key] === "");
};

// ----------------------------------------
// Gameboard functions
// ----------------------------------------

const getGameboardSpaceFromId = (spaceId) => {
  return Array.from(gameboardSpaces).find(({ id }) => id === spaceId);
};

const isGameboardSpaceAvailable = (spaceId) => {
  const gameboardSpace = getGameboardSpaceFromId(spaceId);
  if (!gameboardSpace) return false;
  const gameboardPieces = gameboardSpace.querySelectorAll(
    ".icon:not(.icon--outline)"
  );
  return gameboardPieces.length === 0;
};

const playGameboardSpace = (spaceId) => {
  // If game already over, then don't do anything
  if (gameState.isGameOver) return;

  // Find the gameboard space HTML element
  const gameboardSpace = getGameboardSpaceFromId(spaceId);
  if (!gameboardSpace) {
    console.error("Gameboard space not found: " + spaceId);
    return;
  }

  // If space not available, then don't do anything
  if (!isGameboardSpaceAvailable(spaceId)) return;

  // Place appropriate mark (in its final form)
  clearGameboardSpace(gameboardSpace);
  gameboardSpace.appendChild(createGameboardPiece(gameState.whoseTurn));

  // Update the game state
  recordMove(spaceId);

  // If game is ended, then stop game and render results
  if (renderEndGame()) return;

  // If game still going, then update whose turn it is
  gameboardTurn.dataset.turn = gameState.whoseTurn;

  // Save state to local storage
  setLocalStorageValue(gameState, storageKey);

  // If CPU's turn, then have CPU make a move
  cpuMakeMove();
};

const invertGameboardSpace = (spaceId) => {
  getGameboardSpaceFromId(spaceId).classList.add("box--inverted");
};

function createGameboardPiece(mark = "x", outline = false) {
  if (mark === "") return null;
  const iconInfo =
    gamePieceIcons[mark.toLowerCase() + (outline ? "-outline" : "")];
  const newGameboardPieceOutline = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  newGameboardPieceOutline.setAttribute("role", "img");
  newGameboardPieceOutline.classList.add(...iconInfo.classNames);
  const newIcon = document.createElementNS("http://www.w3.org/2000/svg", "use");
  newIcon.setAttributeNS(
    "http://www.w3.org/1999/xlink",
    "xlink:href",
    iconInfo.svgId
  );
  newGameboardPieceOutline.appendChild(newIcon);
  return newGameboardPieceOutline;
}

const renderEndGame = () => {
  // If game is not ended, then nothing to do, so return false
  if (!gameState.isGameOver) return false;

  // If game is ended, then render results

  // Indicate the winning spaces
  renderWinningSpaces();

  // Update the scoreboard
  if (gameState.isTied) gameState.history.ties++;
  else if (gameState.isWinner) {
    if (gameState.winner.mark === "x") gameState.history.winsPlayerX++;
    else gameState.history.winsPlayerO++;
  }
  updateScoreboard();

  // Save state to local storage
  setLocalStorageValue(gameState, storageKey);

  // Render the results dialog
  renderResultsDialog();

  return true;
};

// ----------------------------------------
// Rendering functions
// ----------------------------------------

const clearGameboardSpace = (space) => {
  // Remove the inverted class from the space
  space.classList.remove("box--inverted");

  // Remove any icons that may exist in this space
  const pieces = space.getElementsByClassName("icon");
  if (pieces.length > 0) {
    Array.from(pieces).forEach((piece) => piece.remove());
  }
};

const clearGameboard = () => {
  if (gameboardSpaces.length > 0) {
    Array.from(gameboardSpaces).forEach((space) => clearGameboardSpace(space));
  }
};

const renderGameboard = () => {
  clearGameboard();
  // for each space, render the appropriate mark
  if (gameboardSpaces.length > 0) {
    Array.from(gameboardSpaces).forEach((space) => {
      if (gameState.gameboard[space.id] !== "")
        space.appendChild(createGameboardPiece(gameState.gameboard[space.id]));
    });
  }
};

const updateScoreboard = () => {
  // X
  scoreboardPlayerXName.textContent = `(${gameState.playerX.shortname})`;
  scoreboardPlayerXWins.textContent = gameState.history.winsPlayerX;

  // Ties
  scoreboardTies.textContent = gameState.history.ties;

  // O
  scoreboardPlayerOName.textContent = `(${gameState.playerO.shortname})`;
  scoreboardPlayerOWins.textContent = gameState.history.winsPlayerO;
};

const renderMainMenu = () => {
  // Hide gameboard and Results Dialogs
  resultsDialog.close();
  gameboard.classList.add("hidden");

  // Show main menu
  mainMenu.classList.remove("hidden");
};

const renderExistingGame = (existingGameState) => {
  // Hide Restart + Results Dialogs
  resultsDialog.close();
  restartDialog.close();

  // (Deep) copy the existing game state object
  gameState = JSON.parse(JSON.stringify(existingGameState));

  // Use newly-loaded game state to:

  // Update whose turn it is
  gameboardTurn.dataset.turn = gameState.whoseTurn;

  // populate the gameboard and scoreboard
  renderGameboard();
  updateScoreboard();

  // Show gameboard and hide main menu
  mainMenu.classList.add("hidden");
  gameboard.classList.remove("hidden");

  // If CPU's turn, then make a move
  cpuMakeMove();
};

const renderNewGame = () => {
  // Hide Restart + Results Dialogs
  resultsDialog.close();
  restartDialog.close();

  // Update whose turn it is
  gameboardTurn.dataset.turn = gameState.whoseTurn;

  // Update the game state
  clearGameboard();

  // Update the scoreboard
  updateScoreboard();

  // Save state to local storage
  setLocalStorageValue(gameState, storageKey);

  // Show gameboard and hide main menu
  mainMenu.classList.add("hidden");
  gameboard.classList.remove("hidden");

  // If CPU's turn, then make a move
  cpuMakeMove();
};

const renderRestartDialog = () => {
  // Show restart menu dialog
  restartDialog.showModal();
};

const renderResultsDialog = () => {
  // Update the dialog with the current results

  // Update which player won
  if (gameState.isWinner) {
    resultsDialog.dataset.winningPlayer =
      gameState.playerX.mark === gameState.winner.mark
        ? gameState.playerX.shortname
        : gameState.playerO.shortname;
  }

  // Update which mark won
  resultsDialog.dataset.winningMark = gameState.isWinner
    ? gameState.winner.mark
    : "tie";

  // Show results dialog
  resultsDialog.showModal();
};

const renderWinningSpaces = () => {
  if (!gameState.isWinner) return;

  invertGameboardSpace(gameState.winner.startingSpace);
  if (gameState.winner.direction === "diagonal") {
    invertGameboardSpace("r2c2");
    gameState.winner.startingSpace === "r1c1"
      ? invertGameboardSpace("r3c3")
      : invertGameboardSpace("r1c3");
  } else if (gameState.winner.direction === "row") {
    // get the starting space row number
    const row = gameState.winner.startingSpace.charAt(1);
    // invert the other spaces in that row
    invertGameboardSpace(`r${row}c2`);
    invertGameboardSpace(`r${row}c3`);
  } else if (gameState.winner.direction === "column") {
    // get the starting space column number
    const column = gameState.winner.startingSpace.charAt(3);
    // invert the other spaces in that column
    invertGameboardSpace(`r2c${column}`);
    invertGameboardSpace(`r3c${column}`);
  } else {
    console.error("Invalid direction: ", gameState.winner.direction);
  }
};

// ----------------------------------------
// Event handlers
// ----------------------------------------

const handleMainMenuButtonClick = (e) => {
  e.preventDefault();

  createNewGameState();

  // Initialize the players for the new game
  const player1 = { mark: "", name: "", shortname: "" };
  const player2 = { mark: "", name: "", shortname: "" };

  // Save the new game player information
  if (e.target.id === "new-game-vs-cpu-button") {
    player1.name = "You";
    player1.shortname = "you";
    player2.name = "CPU";
    player2.shortname = "cpu";
  } else if (e.target.id === "new-game-vs-player-button") {
    player1.name = "Player 1";
    player1.shortname = "p1";
    player2.name = "Player 2";
    player2.shortname = "p2";
  } else {
    console.error("Invalid new game button press: " + e.target.id);
  }

  // Get the mark choice for Player 1
  const selectedPlayer1InputElement = document.querySelector(
    'input[name="player-1-mark"]:checked'
  );
  if (!selectedPlayer1InputElement) {
    console.error("No Player 1 mark selected.");
  }

  // Save the mark choice for each player
  if (selectedPlayer1InputElement.id === "player-1-mark-x") {
    player1.mark = "x";
    player2.mark = "o";
    startNewGame(player1, player2);
  } else if (selectedPlayer1InputElement.id === "player-1-mark-o") {
    player1.mark = "o";
    player2.mark = "x";
    startNewGame(player2, player1);
  } else {
    console.error("Invalid Player 1 mark: " + selectedPlayer1InputElement.id);
  }

  renderNewGame();

  // Print out game state to the console
  // console.log(gameState);
};

const handleGameboardSpaceClick = (e) => {
  e.preventDefault();
  if (
    !gameState.isGameOver &&
    !gameState.isCPUTurn &&
    isGameboardSpaceAvailable(e.target.id)
  ) {
    playGameboardSpace(e.target.id);
  }
};

const handleGameboardSpaceMouseEnter = (e) => {
  e.preventDefault();
  if (
    !gameState.isGameOver &&
    !gameState.isCPUTurn &&
    isGameboardSpaceAvailable(e.target.id)
  ) {
    // Place appropriate mark temporarily (in its outline form)
    e.target.appendChild(createGameboardPiece(gameState.whoseTurn, true));
  }
};

const handleGameboardSpaceMouseLeave = (e) => {
  e.preventDefault();
  // Remove any outline icons
  const outlineIcons = e.target.getElementsByClassName("icon--outline");
  if (outlineIcons.length > 0) {
    Array.from(outlineIcons).forEach((e) => e.remove());
  }
};

const handleRestartGameButtonClick = (e) => {
  e.preventDefault();
  renderRestartDialog();
};

const handleYesRestartGameButtonClick = (e) => {
  e.preventDefault();
  startNewGame(gameState.playerX, gameState.playerO);
  renderNewGame();
};

const handleQuitButtonClick = (e) => {
  // Default is to just close the dialog and do nothing else
  // Then the user can look at the board (and analyze it)
  // Can hit the restart button if they want to start a new game
  e.preventDefault();

  // More in keeping with the design as a I understand it,
  // this button should take user back to the main menu
  // AND clear the game state and history, so the user is
  // starting from scratch and can choose new players
  clearGameState();
  renderMainMenu();
};

const handleNextRoundButtonClick = (e) => {
  // How is this different from handleYesRestartGameButtonClick?
  // If not, then have both use the same handler method?
  e.preventDefault();
  startNewGame(gameState.playerX, gameState.playerO);
  renderNewGame();
};

// ----------------------------------------
// Main program
// ----------------------------------------

newGameVsCPUButton.addEventListener("click", handleMainMenuButtonClick);
newGameVsPlayerButton.addEventListener("click", handleMainMenuButtonClick);

restartGameButton.addEventListener("click", handleRestartGameButtonClick);
yesRestartGameButton.addEventListener("click", handleYesRestartGameButtonClick);

quitButton.addEventListener("click", handleQuitButtonClick);
nextRoundButton.addEventListener("click", handleNextRoundButtonClick);

gameboardSpaces.forEach((space) => {
  space.addEventListener("click", handleGameboardSpaceClick);
  space.addEventListener("mouseenter", handleGameboardSpaceMouseEnter);
  space.addEventListener("mouseleave", handleGameboardSpaceMouseLeave);
});

// If no game state has been saved, then do the default
// which is to start up the main menu from a blank game state

// else a game state has been saved, so
// 1. retrieve game state from local storage
// 2. initialize the game with the current state reflected in that local storage

window.load = loadExistingGameState();

// ----------------------------------------
// End
// ----------------------------------------
