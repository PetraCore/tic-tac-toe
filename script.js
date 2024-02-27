function GameBoard() {
    const rows = 3;
    const columns = rows;
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }

    function Cell() {
        let value = null;

        const fill = (player) => {
            value = player;
        }

        const getValue = () => value;

        return {
            fill,
            getValue
        }
    }

    const getBoard = () => board;

    const markBoard = (row, column, value) => {
        if (row > rows || column > columns) {
            return;
        }

        board[row][column].fill(value);
    };

    const printBoard = () => {
        const boardTable = [];

        for (let i = 0; i < rows; i++) {
            boardTable[i] = [];
            for (let j = 0; j < columns; j++) {
                boardTable[i].push(board[i][j].getValue());
            }
        }

        console.table(boardTable);
    }

    return {
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

    const getActivePlayer = () => activePlayer;

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }

    const board = GameBoard();

    const printNewRound = () => {
        board.printBoard();
        console.log(`${getActivePlayer().name}'s turn.`);
    }

    const playRound = (column, row) => {
        console.log(`Placing ${getActivePlayer().name}'s mark into cell with coordinates: [X: ${column}, Y: ${row}]`);
        board.markBoard(row, column, getActivePlayer().markID);

        printNewRound();
        switchPlayerTurn();
    }

    printNewRound();

    return {
        getActivePlayer,
        playRound
    };
}

const game = GameController();