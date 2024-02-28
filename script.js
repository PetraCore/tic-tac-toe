function GameBoard(
    rows = 3,
    columns = rows
) {
    const board = [];

    const generateNewBoard = () => {
        for (let row = 0; row < rows; row++) {
            board[row] = [];
            for (let column = 0; column < columns; column++) {
                board[row].push(Cell());
            }
        }
    }

    generateNewBoard();

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

    return {
        generateNewBoard,
        getCell,
        getBoard,
        markBoard,
        printBoard
    };
}

function GameController(
    playerOneName = 'P1',
    playerTwoName = 'P2'
) {
    const players = [
        {
            name: playerOneName,
            markID: 1,
        },
        {
            name: playerTwoName,
            markID: 2,
        },
    ];

    let activePlayer = players[0];
    let isGameInProgress = false;

    const getActivePlayer = () => {
        if (!isGameInProgress) {
            return null;
        }
        return activePlayer;
    };

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }

    const boardRows = 3;
    const boardColumns = boardRows;
    const board = GameBoard(boardRows, boardColumns);

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    }

    const printVictoryScreen = (victor) => {
        board.printBoard();
        console.log(`${victor.name} has won!`);
    }

    const handleVictory = (victor) => {
        isGameInProgress = false;
        printVictoryScreen(victor);
    }

    const checkIllegalMoves = (row, column) => {
        if (!isGameInProgress) {
            console.warn(`Cannot place new marks - the game has ended!`);
            console.log(`Start new game by entering "game.startNewGame()" command`);
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

    const playRound = (column, row) => {
        if (checkIllegalMoves(row, column)) {
            return;
        }

        console.log(`Placing ${getActivePlayer().name}'s mark into cell with coordinates: [X: ${column}, Y: ${row}]`);
        board.markBoard(row, column, getActivePlayer().markID);

        if (checkWinningConditions()) {
            handleVictory(getActivePlayer());
            return;
        }

        printNewRound();
        switchPlayerTurn();
    }

    const startNewGame = () => {
        isGameInProgress = true;
        board.generateNewBoard();
        printNewRound();
    }

    startNewGame();

    return {
        getActivePlayer,
        playRound,
        startNewGame
    };
}

const game = GameController();