function GameBoard(
    rows = 3,
    columns = rows
) {
    const board = [];

    function Cell() {
        let value = null;
        
        const fill = (val) => {
            value = val;
        }

        const getValue = () => value;

        return {
            fill,
            getValue
        }
    }

    const getCell = (row, column) => {
        if (row >= rows || column >= columns) {
            return undefined;
        }
        return board[row][column];
    }

    const generateNewBoard = (newRows = rows, newColumns = columns) => {
        rows = newRows;
        columns = newColumns;

        for (let row = 0; row < newRows; row++) {
            board[row] = [];
            for (let column = 0; column < newColumns; column++) {
                board[row].push(Cell());
            }
        }
    }

    const getBoard = () => board;

    const markBoard = (row, column, value) => {
        let cell = getCell(row, column);

        if (cell === undefined) {
            console.error(`Cannot access cell: cell out of bounds!`);
            return;
        }

        cell.fill(value);
    };

    const printBoard = () => {
        const boardTable = [];

        for (let row = 0; row < rows; row++) {
            boardTable[row] = [];
            for (let column = 0; column < columns; column++) {
                boardTable[row].push(board[row][column].getValue());
            }
        }

        console.table(boardTable);
    }

    generateNewBoard();

    return {
        generateNewBoard,
        getCell,
        getBoard,
        markBoard,
        printBoard
    };
}



const gameController = (function () {
    let boardSize = 3;
    let boardRows = boardSize;
    let boardColumns = boardRows;
    const board = GameBoard(boardRows, boardColumns);

    let isGameInProgress = false;

    const setGameboardSize = (size) => {
        boardSize = size;
        boardRows = boardSize;
        boardColumns = boardRows;
    } 

    const players = [
        {
            name: 'P1',
            markID: 1,
        },
        {
            name: 'P2',
            markID: 2,
        },
    ];

    const getRandomPlayer = () => {
        return players[Math.round(Math.random() * (players.length - 1))];
    }

    let activePlayer = getRandomPlayer();

    const getActivePlayer = () => {
        if (!isGameInProgress) {
            return null;
        }
        return activePlayer;
    };

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }



    const screenController = (function () {
        const screen = document.querySelector('.main');

        const displayMenuScreen = () => {
            screen.innerHTML = `
                <div class="settings">
                    <h1>Settings</h1>
                    <form id="gameSettings">
                        <div class="label">
                            <label for="player1">Player 1 name</label>
                            <input type="text" name="player1" id="player1" maxlength="15" placeholder="${players[0].name}">
                        </div>
                        <div class="label">
                            <label for="player2">Player 2 name</label>
                            <input type="text" name="player2" id="player2" maxlength="15" placeholder="${players[1].name}">
                        </div>
                        <div class="label">
                            <label for="player2">Board size</label>
                            <input type="number" name="size" id="size" min="1" max="10" placeholder="${boardSize}">
                        </div>
                        <button>Start Game</button>
                    </form>
                </div>
            `;

            const settings = screen.querySelector('#gameSettings');
            settings.addEventListener('submit', (event) => {
                event.preventDefault();

                const p1Name = document.querySelector('#player1').value;
                const p2Name = document.querySelector('#player2').value;
                const size = document.querySelector('#size').value;

                players[0].name = p1Name ? p1Name : players[0].name;
                players[1].name = p2Name ? p2Name : players[1].name;

                if(size) {
                    startNewGame(size);
                    return;
                }

                startNewGame();
            });
        } 

        const displayGameScreen = () =>  {
            screen.innerHTML = '';

            const gameWrapper = document.createElement('div');
            gameWrapper.classList.add('ticTacToe');

            const gameStateInfo = document.createElement('h1');
            gameStateInfo.classList.add('gameStateInfo');
            gameStateInfo.innerHTML = `
                <span class="player1">P1</span>
                vs
                <span class="player2">P2</span>
            `;

            const gameboard = document.createElement('div');
            gameboard.classList.add('board');
            gameboard.style.display = 'grid';
            gameboard.style.gridTemplate = 
            `repeat(${boardRows}, 1fr) / repeat(${boardColumns}, 1fr)`;

            const options = document.createElement('div');
            options.classList.add('options');

            const settingsBtn = document.createElement('button');
            settingsBtn.textContent = 'Settings';
            settingsBtn.addEventListener('click', openMenuScreen);

            const restartBtn = document.createElement('button');
            restartBtn.textContent = 'Restart';
            restartBtn.addEventListener('click', () => {startNewGame()});

            options.appendChild(settingsBtn);
            options.appendChild(restartBtn);

            gameWrapper.appendChild(gameStateInfo);
            gameWrapper.appendChild(gameboard);
            gameWrapper.appendChild(options);

            screen.appendChild(gameWrapper);

            displayGameboard();
        };

        const handleCellActivation = (event) => {
            const cell = event.target;
            const row = cell.dataset.row;
            const column = cell.dataset.column;

            playRound(column, row);
        }

        const displayGameboard = () => {
            const gameboard = screen.querySelector('.board');
            gameboard.innerHTML = '';

            for (let row = 0; row < boardRows; row++) {
                for (let column = 0; column < boardColumns; column++) {
                    let cell = document.createElement('button');

                    cell.classList.add('cell');
                    cell.setAttribute('data-row', row);
                    cell.setAttribute('data-column', column);
                    cell.addEventListener('click', handleCellActivation);

                    gameboard.appendChild(cell);
                }
            }
        };

        const getMarkIconHTML = (playerID) => {
            switch(playerID) {
                case 1: return `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12q0-3.35-2.325-5.675T12 4Q8.65 4 6.325 6.325T4 12q0 3.35 2.325 5.675T12 20m0-8"/></svg>`;
                case 2: return `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"/></svg>`;
                default: return '?';
            }
        }

        const updateCell = (row, column) => {
            const cell = screen.querySelector(`.cell[data-row="${row}"][data-column="${column}"]`);
            const playerID = board.getCell(row, column).getValue();

            cell.classList.add(`player${playerID}`);
            cell.innerHTML = getMarkIconHTML(playerID); 
            cell.disabled = true;
        }

        const lockGameBoard = () => {
            const cells = screen.querySelectorAll('.cell');
            cells.forEach(cell => {
                cell.disabled = true;
                cell.setAttribute('tabindex', -1);
            });
        }

        const displayMessage = (message) => {
            const gameStateInfo = document.querySelector('.gameStateInfo');
            gameStateInfo.innerHTML = message;
        }

        return {
            displayMenuScreen,
            displayGameScreen,
            updateCell,
            lockGameBoard,
            displayMessage
        }
    })();



    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);

        const message = `
            <span class="player${getActivePlayer().markID}">
                ${getActivePlayer().name}'s
            </span>
            turn
        `;
        screenController.displayMessage(message);
    }

    const printVictoryScreen = (victor) => {
        board.printBoard();
        console.log(`${victor.name} has won!`);

        const message = `
            <span class="player${victor.markID}">
                ${victor.name}
            </span>
            has won!
        `;
        screenController.displayMessage(message);
    }

    const printTieScreen = () => {
        board.printBoard()
        console.log(`It's a tie!`);

        const message = `
            It's a
            <span class="player1 player2">
                tie!
            </span>
        `;
        screenController.displayMessage(message);
    } 

    const handleVictory = (victor) => {
        isGameInProgress = false;
        screenController.lockGameBoard();
        printVictoryScreen(victor);
    }

    const handleTie = () => {
        isGameInProgress = false;
        printTieScreen();
    }

    const checkIllegalMoves = (row, column) => {
        if (!isGameInProgress) {
            console.warn(`Cannot place new marks - the game has ended!`);
            console.log(`Start new game by entering "gameController.startNewGame()" command`);
            return true;
        }

        const cell = board.getCell(row, column);
        if (cell === undefined) {
            console.warn(`Cannot place ${getActivePlayer().name}'s mark into cell with coordinates: [X: ${column}, Y: ${row}] - this cell is out of bounds!`);
            console.log(`Try again.`);
            return true;
        }
        
        if (cell.getValue() !== null) {
            console.warn(`Cannot place ${getActivePlayer().name}'s mark into cell with coordinates: [X: ${column}, Y: ${row}] - this cell is already occupied!`);
            console.log(`Try again.`);
            return true;
        }

        return false;
    }

    const checkWinningConditions = () => {

        // Check rows

        for (let row = 0; row < boardRows; row++) {
            let rowMarkID = board.getCell(row, 0).getValue();
            let victory = true;

            for (let column = 1; column < boardColumns; column++) {
                if (rowMarkID === null 
                    || board.getCell(row, column).getValue() !== rowMarkID) {
                    victory = false;
                    break;
                }
            }

            if (victory === true) {
                return true;
            }
        }


        // Check columns

        for (let column = 0; column < boardRows; column++) {
            let rowMarkID = board.getCell(0, column).getValue();
            let victory = true;

            for (let row = 1; row < boardColumns; row++) {
                if (rowMarkID === null 
                    || board.getCell(row, column).getValue() !== rowMarkID) {
                    victory = false;
                    break;
                }
            }

            if (victory === true) {
                return true;
            }
        }


        // Check diagonals (assumes that the GameBoard is a square)

        let rowMarkID = board.getCell(0, 0).getValue();
        let victory = true;

        for (let diagonal = 1; diagonal < boardRows; diagonal++) {
            if (rowMarkID === null
                || board.getCell(diagonal, diagonal).getValue() !== rowMarkID) {
                victory = false;
                break;
            }
        }

        if (victory === true) {
            return true;
        }


        rowMarkID = board.getCell(0, boardColumns - 1).getValue();
        victory = true;

        for (let diagonal = 1; diagonal < boardRows; diagonal++) {
            if (rowMarkID === null
                || board.getCell(diagonal, diagonal % (boardColumns - 1)).getValue() !== rowMarkID) {
                victory = false;
                break;
            }
        }

        if (victory === true) {
            return true;
        }

        return false;
    }

    const checkTieConditions = () => {
        for (let row = 0; row < boardRows; row++) {
            for (let column = 0; column < boardColumns; column++) {
                if (board.getCell(row, column).getValue() === null) {
                    return false;
                }
            }
        }
        return true;
    }

    const playRound = (column, row) => {
        if (checkIllegalMoves(row, column)) {
            return;
        }

        board.markBoard(row, column, getActivePlayer().markID);
        screenController.updateCell(row, column);

        if (checkWinningConditions()) {
            handleVictory(getActivePlayer());
            return;
        }

        if (checkTieConditions()) {
            handleTie();
            return;
        }

        switchPlayerTurn();
        printNewRound();
    }

    const startNewGame = (boardDimensions = boardSize) => {
        boardDimensions = parseInt(boardDimensions);
        if(boardDimensions > 10 || boardDimensions < 1) {
            console.error(`Cannot generate ${boardDimensions} x ${boardDimensions} board. Please provide a value between 1 and 10.`);
            return;
        }

        isGameInProgress = true;
        activePlayer = getRandomPlayer();

        setGameboardSize(boardDimensions);
        board.generateNewBoard(boardRows, boardColumns);

        screenController.displayGameScreen();
        printNewRound();
    }

    const openMenuScreen = () => {
        isGameInProgress = false;
        screenController.displayMenuScreen();
    } 

    openMenuScreen();

    return {
        getActivePlayer,
        playRound,
        startNewGame
    };
})();