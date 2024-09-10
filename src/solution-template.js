let board = [];
let squaresLeft = 0;
let maxProbability = 100;
let gameOver = false;
let firstClick = true;

let easy = {
    'rowCount': 9,
    'colCount': 9,
    'bombProbability': 12
};

let medium = {
    'rowCount' : 16,
    'colCount' : 16,
    'bombProbability': 16
};

let expert = {
    'rowCount' : 16,
    'colCount' : 30,
    'bombProbability': 21
};

function minesweeperGameBootstrapper(difficulty) {
    let boardMetadata;
    switch (difficulty) {
        case 'medium':
            boardMetadata = medium;
            break;
        case 'expert':
            boardMetadata = expert;
            break;
        default:
            boardMetadata = easy;
    }

    document.getElementById("customProbability").value = "";

    const customProbability = document.getElementById("customProbability").value;
    if (customProbability) {
        const parsedCustomProbability = parseInt(customProbability);
        if (parsedCustomProbability >= 0 && parsedCustomProbability <= 100) {
            boardMetadata.bombProbability = parsedCustomProbability;
        }
    }

    reset(boardMetadata);
}

function reset(boardMetadata) {
    board = [];
    gameOver = false;
    firstClick = true;
    document.getElementById("customProbability").value = "";
    generateBoard(boardMetadata);
    render();
}

// generate board in the initial state without any bombs
function generateBoard(boardMetadata) {
    let { rowCount, colCount, bombProbability } = boardMetadata;
    // initialize board
    for (let i = 0; i < rowCount; i++) {
        board[i] = [];
        for (let j = 0; j < colCount; j++) {
            board[i][j] = new BoardSquare();
        }
    }
}

// place bombs
function placeBombs(excludeRow, excludeCol, boardMetadata) {
    let { rowCount, colCount, bombProbability } = boardMetadata;
    let bombsToPlace = Math.floor((rowCount * colCount * bombProbability) / maxProbability);
    squaresLeft = (rowCount * colCount) - bombsToPlace;
    let placedBombs = 0;

    while (placedBombs < bombsToPlace) {
        let randRow = Math.floor(Math.random() * rowCount);
        let randCol = Math.floor(Math.random() * colCount);

        if ((Math.abs(randRow - excludeRow) <= 1 && Math.abs(randCol - excludeCol) <= 1) || board[randRow][randCol].hasBomb) {
            continue;
        }

        board[randRow][randCol].hasBomb = true;
        placedBombs++;
    }

    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            if (!board[i][j].hasBomb) {
                let count = 0;
                for (let x = -1; x <= 1; x++) {
                    for (let y = -1; y <= 1; y++) {
                        const nx = x + i;
                        const ny = y + j;
                        if (nx >= 0 && nx < rowCount && ny >= 0 && ny < colCount && board[nx][ny].hasBomb) {
                            count++;
                        }
                    }
                }
                board[i][j].bombsAround = count;
            }
        }
    }
}

// flag or unflag a square
function flagSquare(row, col) {
    if(board[row][col].state === 0) {
        board[row][col].state = 1;
    } else if (board[row][col].state === 1) {
        board[row][col].state = 0;
    }
    render();
}

// reveal a square
function revealSquare(row, col) {
    if (gameOver || row < 0 || col < 0 || row >= board.length || col >= board[0].length) {
        return;
    }
    if (board[row][col].state === 2 || board[row][col].state === 1) {
        return; 
    }

    if (firstClick) {
        placeBombs(row, col, board[0].length === 9 ? easy : board[0].length === 16 && board.length === 16 ? medium : expert);
        firstClick = false;
    }

    board[row][col].state = 2;

    if (board[row][col].hasBomb) {
        board[row][col].state = 2;
        render();
        gameOver = true;
        setTimeout(() => {
            alert("Oh no, game over! You stepped on a mine!");
            reset(board[0].length === 9 ? easy : board[0].length === 16 && board.length === 16 ? medium : expert);
        }, 300);
        return;
    }

    squaresLeft--;
    if(squaresLeft == 0) {
        gameOver = true;
        alert("Congratulations! You won!");
        setTimeout(() => {
            const difficulty = board[0].length === 9 ? 'easy' : (board[0].length === 16 && board.length === 16 ? 'medium' : 'expert');
            minesweeperGameBootstrapper(difficulty);
        }, 300);
        return;
    }

    if (board[row][col].bombsAround === 0) {
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (x != 0 || y!= 0) {
                    revealSquare(row + x, col + y);
                }
            }
        }
    }

    render();
}

function render() {
    const gameBoard = document.getElementById("gameBoard");
    gameBoard.innerHTML = "";

    const rowCount = board.length;
    const colCount = board[0].length;

    gameBoard.style.gridTemplateColumns = `repeat(${colCount}, 30px)`;

    for (let i = 0; i < rowCount; i++) {
        for (let j = 0; j < colCount; j++) {
            const square = document.createElement("div");
            square.className = "square";

            if (board[i][j].state === 1) {
                square.classList.add("flagged");
            } else if (board[i][j].state === 2) {
                if (board[i][j].hasBomb) {
                    square.classList.add("bomb");
                } else if (board[i][j].bombsAround > 0) {
                    square.classList.add("revealed");
                    square.textContent = board[i][j].bombsAround;
                } else {
                    square.classList.add("revealed");
                }
            }

            square.addEventListener("click", () => revealSquare(i, j));
            square.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                flagSquare(i, j);
            });

            gameBoard.appendChild(square);
        }
    }
}

class BoardSquare {
    constructor() {
        this.hasBomb = false;
        this.bombsAround = 0;
        // square states: closed - 0; flagged - 1; revealed - 2;
        this.state = 0;
    }
}

document.getElementById("difficulty").addEventListener("change", (event) => {
    const difficulty = event.target.value;
    minesweeperGameBootstrapper(difficulty);
});

document.getElementById("resetButton").addEventListener("click", () => {
    const difficulty = document.getElementById("difficulty").value;
    minesweeperGameBootstrapper(difficulty);
});

window.onload = () => {
    minesweeperGameBootstrapper('easy');
};


