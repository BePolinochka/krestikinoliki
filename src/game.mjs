import {InlineKeyboard} from "grammy";

export const size = 3;

const symbols = {
    empty: " ",
    player: "❌",
    computer: "⭕️",
}

export const createMatrix = () => new Array(size).fill(null).map(() => new Array(size).fill(null));

export function matrixToKeyboard(matrix) {
    const reply_markup = new InlineKeyboard()
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            reply_markup.text(
                symbols[matrix[row][col] || "empty"],
                [row, col].join(":")
            )
        }
        reply_markup.row()
    }
    return reply_markup;
}

export function getAvailableCell(matrix) {
    const availableCells = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (!matrix[row][col]) availableCells.push([row, col]);
        }
    }
    return availableCells[Math.floor(Math.random() * availableCells.length)];
}

export function isWinner(matrix, side) {
    for (let row = 0; row < size; row++) {
        if (matrix[row].every(cell => cell === side)) return true;
    }
    for (let col = 0; col < size; col++) {
        if (matrix.every(row => row[col] === side)) return true;
    }
    if (
        matrix[0][0] === side &&
        matrix[1][1] === side &&
        matrix[2][2] === side
    ) return true;
    if (
        matrix[0][2] === side &&
        matrix[1][1] === side &&
        matrix[2][0] === side
    ) return true;
}