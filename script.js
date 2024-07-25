// Constants for difficulty levels (number of empty cells)
const EASY = 40;
const MEDIUM = 50;
const HARD = 60;

// Initialize Sudoku grid
const sudokuGrid = document.getElementById('sudoku-grid');
let originalPuzzle = [];
let correctSolution = [];

// Timer variables
let timer;
let timerInterval;

// Create a 9x9 Sudoku grid
function createGrid() {
    sudokuGrid.innerHTML = '';
    for (let i = 0; i < 81; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        const input = document.createElement('input');
        input.setAttribute('type', 'number');
        input.setAttribute('min', '1');
        input.setAttribute('max', '9');
        cell.appendChild(input);

        sudokuGrid.appendChild(cell);
    }
}

// Generate a Sudoku puzzle
function generatePuzzle(difficulty) {
    createGrid();

    const cells = document.querySelectorAll('.cell input');
    const puzzle = generateSudoku(difficulty);

    for (let i = 0; i < 81; i++) {
        if (puzzle[i] !== 0) {
            cells[i].value = puzzle[i];
            cells[i].setAttribute('disabled', 'true');
        } else {
            cells[i].value = '';
            cells[i].removeAttribute('disabled');
        }
    }

    originalPuzzle = puzzle;
    correctSolution = solveSudokuInternal(originalPuzzle.slice());

    // Automatically start timer with selected duration
    const duration = parseInt(document.getElementById('timerSelect').value);
    startTimer(duration);
}

// Generate a complete, valid Sudoku board
function generateCompleteSudoku() {
    let board = Array.from({ length: 81 }, () => 0);

    const fillDiagonalBoxes = () => {
        for (let i = 0; i < 81; i += 27) {
            fillBox(i);
        }
    };

    const fillBox = (index) => {
        let num;
        for (let i = 0; i < 9; i++) {
            do {
                num = Math.floor(Math.random() * 9) + 1;
            } while (!isSafe(board, index + i % 3 + Math.floor(i / 3) * 9, num));
            board[index + i % 3 + Math.floor(i / 3) * 9] = num;
        }
    };

    const fillRemaining = (index) => {
        if (index >= 81) return true;

        if (board[index] !== 0) return fillRemaining(index + 1);

        for (let num = 1; num <= 9; num++) {
            if (isSafe(board, index, num)) {
                board[index] = num;
                if (fillRemaining(index + 1)) return true;
                board[index] = 0;
            }
        }
        return false;
    };

    fillDiagonalBoxes();
    fillRemaining(0);

    return board;
}

// Check if a number can be safely placed in a cell
function isSafe(board, index, num) {
    const row = Math.floor(index / 9);
    const col = index % 9;

    // Check row
    for (let i = 0; i < 9; i++) {
        if (board[row * 9 + i] === num) return false;
    }

    // Check column
    for (let i = 0; i < 9; i++) {
        if (board[i * 9 + col] === num) return false;
    }

    // Check 3x3 box
    const startRow = row - row % 3;
    const startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[(startRow + i) * 9 + startCol + j] === num) return false;
        }
    }

    return true;
}

// Remove numbers from the board to create a puzzle with a unique solution
function generateSudoku(difficulty) {
    const completeBoard = generateCompleteSudoku();
    let puzzle = completeBoard.slice();

    let cellsToRemove = difficulty;
    let attempts = 0;

    while (cellsToRemove > 0 && attempts < 1000) {
        const index = Math.floor(Math.random() * 81);

        if (puzzle[index] !== 0) {
            const backup = puzzle[index];
            puzzle[index] = 0;

            // Check if the puzzle still has a unique solution
            if (!hasUniqueSolution(puzzle.slice())) {
                puzzle[index] = backup;
            } else {
                cellsToRemove--;
            }
        }

        attempts++;
    }

    return puzzle;
}

// Check if a puzzle has a unique solution
function hasUniqueSolution(board) {
    let solutions = 0;

    const solveAndCount = (board, index) => {
        if (index >= 81) {
            solutions++;
            return solutions === 1;
        }

        if (board[index] !== 0) return solveAndCount(board, index + 1);

        for (let num = 1; num <= 9; num++) {
            if (isSafe(board, index, num)) {
                board[index] = num;
                if (!solveAndCount(board, index + 1)) return false;
                board[index] = 0;
            }
        }

        return true;
    };

    solveAndCount(board.slice(), 0);
    return solutions === 1;
}

// Solve Sudoku using backtracking
function solveSudoku() {
    const cells = document.querySelectorAll('.cell input');
    const board = Array.from(cells).map(cell => parseInt(cell.value) || 0);

    if (solve(board, 0)) {
        board.forEach((num, index) => {
            cells[index].value = num;
        });
    } else {
        alert('No solution found!');
    }
}

// Internal solve function to return solution for checking
function solveSudokuInternal(board) {
    if (solve(board, 0)) {
        return board;
    } else {
        return null;
    }
}

// Recursive backtracking function
function solve(board, index) {
    if (index >= 81) return true;

    if (board[index] !== 0) return solve(board, index + 1);

    for (let num = 1; num <= 9; num++) {
        if (isSafe(board, index, num)) {
            board[index] = num;
            if (solve(board, index + 1)) return true;
            board[index] = 0;
        }
    }

    return false;
}

// Check if the user's solution is correct
function checkSolution() {
    const cells = document.querySelectorAll('.cell input');
    const userSolution = Array.from(cells).map(cell => parseInt(cell.value) || 0);

    const isCorrect = userSolution.every((num, index) => num === correctSolution[index]);

    // Treat empty cells as wrong
    const hasEmptyCells = userSolution.includes(0);

    if (isCorrect && !hasEmptyCells) {
        clearInterval(timerInterval); // Stop the timer if correct
        alert('You won!');
    } else {
        alert('You lost!');
    }
}

// Handle the timer logic
function startTimer(duration) {
    clearInterval(timerInterval);
    let timeRemaining = duration;
    timerDisplay.innerText = formatTime(timeRemaining);

    timerInterval = setInterval(() => {
        timeRemaining--;
        timerDisplay.innerText = formatTime(timeRemaining);

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            alert('Time is up! You lost!');
        }
    }, 1000);
}

// Format the timer display
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Event listeners for buttons
document.getElementById('easy').addEventListener('click', () => generatePuzzle(EASY));
document.getElementById('medium').addEventListener('click', () => generatePuzzle(MEDIUM));
document.getElementById('hard').addEventListener('click', () => generatePuzzle(HARD));
document.getElementById('solve').addEventListener('click', solveSudoku);
document.getElementById('checkSolution').addEventListener('click', checkSolution);
document.getElementById('howToPlay').addEventListener('click', () => {
    window.open('https://sudoku.com/how-to-play/sudoku-rules-for-complete-beginners/', '_blank');
});

// Timer display
const timerDisplay = document.getElementById('timerDisplay');

// Initialize the grid on page load
createGrid();
