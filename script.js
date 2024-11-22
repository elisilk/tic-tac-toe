// ----------------------------------------
// Global variables
// ----------------------------------------

const gameHistory = {
  winsPlayerX: 0,
  winsPlayerO: 0,
  ties: 0,
};

// keep track of current state:
// - who is each player
// - whose turn is it
// - what pieces have been played in which spaces

const gameState = {
  playerX: { mark: "", name: "", shortname: "" },
  playerO: { mark: "", name: "", shortname: "" },
  isMultiplayer: true,
  whoseTurn: "",
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
  isTied: false,
  isWinner: false,
  winner: {
    mark: "",
    startingSpace: "",
    direction: "",
  },
};

const gamePieceIcons = {
  x: {
    classNames: ["icon", "icon--x", "icon--filled"],
    svgId: "#icon-x",
  },
  o: {
    classNames: ["icon", "icon--o", "icon--filled"],
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

const cpuMakeMove = () => {
  // If multiplayer game, then CPU not involved, so return
  if (gameState.isMultiplayer) return;
  // If CPU is X and it's not X's turn, then return
  if (gameState.playerX.name === "CPU" && gameState.whoseTurn !== "x") return;
  // If CPU is O and it's not O's turn, then return
  if (gameState.playerO.name === "CPU" && gameState.whoseTurn !== "o") return;

  // Find the next space to play
  // (randomly or from some other fancier algorithm)

  // Find all the available spaces remaining
  const availableSpaces = Object.keys(gameState.gameboard).filter(
    (key) => gameState.gameboard[key] === ""
  );

  // Fancier algorithm (pseudocode)
  // - if a winning move exists for the CPU, play that move
  // - if a winning move exists for the user, play that move (defensively)
  // - (try to set up opportunites for two options to win)
  // - (try to limit user opportunites for two options to win)
  cpuEvaluateOptions();

  // Choose randomly among the remaining available spaces
  const chosenSpaceId =
    availableSpaces[Math.floor(Math.random() * availableSpaces.length)];

  // Place appropriate mark (in its final form)
  const chosenSpace = getGameboardSpaceFromId(chosenSpaceId);
  chosenSpace.appendChild(createGameboardPiece(gameState.whoseTurn));

  // Update the game state
  recordMove(chosenSpaceId);

  // If game is ended, then stop game and render results
  if (renderEndGame()) return;

  // If game still going, then update whose turn it is
  gameboardTurn.dataset.turn = gameState.whoseTurn;
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
    gameState.isWinner = true;
    gameState.winner = winnerInfo;
    return;
  }

  // Check if new move results in a tie
  if (isTied()) {
    // Update game state with the tie state
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
  // if three "x", then score = 3
  // if two "x" & one "", then score = 2
  // if one "x" & two "", then score = 1
  // if three "", then score = 0
  // if one "o" & two "", then score = -1
  // if two "o" & one "", then score = -2
  // if three "o", then score = -3
  // if one "" & one of "x" & one of "o", then score = (0?)
};

const cpuGameStateEvaluation = {
  row1: { type: "row", startLocation: 1, winPotential: 0 },
  row2: { type: "row", startLocation: 2, winPotential: 0 },
  row3: { type: "row", startLocation: 3, winPotential: 0 },
  col1: { type: "column", startLocation: 1, winPotential: 0 },
  col2: { type: "column", startLocation: 2, winPotential: 0 },
  col3: { type: "column", startLocation: 3, winPotential: 0 },
  diag1: { type: "diagonal", startLocation: 1, winPotential: 0 },
  diag3: { type: "diagonal", startLocation: 3, winPotential: 0 },
};

const cpuEvaluateOptions = () => {
  //console.log(getSpacesInDiagonal(1));
  calculateSpacesWinPotential(getSpacesInDiagonal(1));

  return false;

  // Retrieve the 3 spaces under consideration
  // Exactly two must have marks played on them
  // The third space must be open
  // The two marks must be the same mark
  // If all those are true, then return true

  // Find all the available spaces remaining
  /* const availableSpaces = Object.keys(gameState.gameboard).filter(
    (key) => gameState.gameboard[key] === ""
  ); */

  /* const row = gameState.winner.startingSpace.charAt(1);
  // invert the other spaces in that row
  invertGameboardSpace(`r${row}c2`);
  invertGameboardSpace(`r${row}c3`); */

  /* return (
    gameState.gameboard[`r${row}c1`] !== "" &&
    gameState.gameboard[`r${row}c1`] === gameState.gameboard[`r${row}c2`] &&
    gameState.gameboard[`r${row}c1`] === gameState.gameboard[`r${row}c3`]
  ); */
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

const isTied = () => {
  // Check if any blank spaces remaining on the gameboard
  return Object.values(gameState.gameboard).indexOf("") == -1;
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
  if (gameState.isWinner || gameState.isTied) return;

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

  // If CPU's turn, then have CPU make a move
  cpuMakeMove();
};

const invertGameboardSpace = (spaceId) => {
  getGameboardSpaceFromId(spaceId).classList.add("box--inverted");
};

function createGameboardPiece(mark = "x", outline = false) {
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
  if (!gameState.isWinner && !gameState.isTied) return false;

  // If game is ended, then render results

  // Indicate the winning spaces
  renderWinningSpaces();

  // Update the scoreboard
  if (gameState.isTied) gameHistory.ties++;
  if (gameState.isWinner) {
    if (gameState.winner.mark === "x") gameHistory.winsPlayerX++;
    else gameHistory.winsPlayerO++;
  }
  updateScoreboard();

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

const updateScoreboard = () => {
  // X
  scoreboardPlayerXName.textContent = `(${gameState.playerX.shortname})`;
  scoreboardPlayerXWins.textContent = gameHistory.winsPlayerX;

  // Ties
  scoreboardTies.textContent = gameHistory.ties;

  // O
  scoreboardPlayerOName.textContent = `(${gameState.playerO.shortname})`;
  scoreboardPlayerOWins.textContent = gameHistory.winsPlayerO;
};

const renderMainMenu = () => {
  // Hide gameboard and Results Dialogs
  resultsDialog.close();
  gameboard.classList.add("hidden");

  // Reset the scoreboard
  gameHistory.winsPlayerX = 0;
  gameHistory.winsPlayerO = 0;
  gameHistory.ties = 0;

  // Show main menu
  mainMenu.classList.remove("hidden");
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

  playGameboardSpace(e.target.id);
};

const handleGameboardSpaceMouseEnter = (e) => {
  e.preventDefault();
  if (
    !gameState.isWinner &&
    !gameState.isTied &&
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
  // Alternatively, this button could take user back
  // to the main menu
  // And clear the board? (maybe not necessary)
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

// Render the Main Menu
// mainMenuForm = renderMainMenu(allQuizData, mainElement);

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

// ----------------------------------------
// End
// ----------------------------------------
