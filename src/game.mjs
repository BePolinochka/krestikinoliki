import {InlineKeyboard} from "grammy";
import OpenAI from 'openai';

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const size = 3;

const symbols = ["❌", "⭕️"]
export const startKeyboard = new InlineKeyboard().text("Start the Game", "start");

export const createMatrix = () => new Array(size).fill(null).map(() => new Array(size).fill(null));

export function matrixToKeyboard(matrix, symbol) {
    const marks = {
        player: symbol,
        computer: symbols.filter(mark => mark !== symbol)[0]
    }
    const reply_markup = new InlineKeyboard()
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            reply_markup.text(
                marks[matrix[row][col]] || "・",
                [row, col].join(":")
            )
        }
        reply_markup.row()
    }
    return reply_markup;
}

export function getAvailableCells(matrix) {
    const availableCells = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (!matrix[row][col]) availableCells.push([row, col]);
        }
    }
    return availableCells//[Math.floor(Math.random() * availableCells.length)];
}

export async function getAvailableCell(matrix) {

    let messages = [
        {
            role: "user",
            content: `
Ты играешь в крестики-нолики на поле 3 на 3 клетки, 
в роли компьютера (computer) на этом поле: 

${JSON.stringify(matrix)}

Игроки : компьютер (computer) и игрок (player) по очереди ставят крестики или нолики в свободные клетки (null).

Где computer - это твой ход в свободную клетку (null). 
Где player - это ход твоего противника в  свободную клетку (null).

Ты ходишь после хода игрока (player).
Нельзя выбирать клетки где уже был ход (player, computer), только свободные (null). 
Цель игры - первым поставить три своих хода в ряд, начиная с любой клетки.
Игра считается оконченной, когда один из игроков достигает этой цели.
Твоя задача - выбирать координаты клетки поля, наиболее вероятные для победы. 
Напиши случайную координату в json формате:

${JSON.stringify({row: 0, col: 2})}

Где:
row - это номер строки
col - это номер столбца

Значения любого из них, должно быть в диапазоне от 0 до 2 (как и в массиве с полем).
`
        }
    ];
    const response = await openai.chat.completions.create({
        response_format: {type: "json_object"},
        model: 'gpt-4-turbo-preview',
        messages
    });
    const {row, col} = JSON.parse(response.choices.at(0).message.content)
    console.log(response.choices.at(0).message.content)
    return [row, col]
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