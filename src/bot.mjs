/*
Пользователь заходит в бот, нажимает "Старт".
Бот направляет ползователю поле для игры.
Пользователь выбирает ячейку для своего хода с помощью Inline keyboard и отправляет результат боту.
Бот делает свой ход в свободную ячейку и отвечает пользователю.
*/

import {Bot, InlineKeyboard, session} from "grammy";
import {freeStorage} from "@grammyjs/storage-free";

export const {
    TELEGRAM_BOT_TOKEN: token,
    TELEGRAM_SECRET_TOKEN: secretToken = String(token).split(":").pop()
} = process.env;

const size = 3;

const symbols = {
    empty: " ",
    player: "❌",
    computer: "⭕️",
}

export const bot = new Bot(token);

const safe = bot.errorBoundary(e => console.error(e));

const startKeyboard = new InlineKeyboard().text("*Кнопка начала игры*", "start");

safe.use(session({
    initial: () => ({isGame: false}),
    storage: freeStorage(bot.token),
}));

safe.command("start", ctx =>
    ctx.reply(`*Приветствие*`, {
        reply_markup: startKeyboard
    })
);

function matrixToKeyboard(matrix) {
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

function getAvailableCell(matrix) {
    const availableCells = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (!matrix[row][col]) availableCells.push([row, col]);
        }
    }
    return availableCells[Math.floor(Math.random() * availableCells.length)];
}

function isWinner(matrix, side) {
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

safe.callbackQuery("start", async ctx => {
    ctx.session.isGame = true;
    ctx.session.matrix = new Array(size).fill(null)
        .map(() => new Array(size).fill(null));
    await ctx.reply("*Уведомелние о старте игры*", {
        reply_markup: matrixToKeyboard(ctx.session.matrix)
    })
    return ctx.deleteMessage();

})

safe.on("callback_query:data", async (ctx) => {
    // await ctx.answerCallbackQuery({text: ctx.callbackQuery.data});
    const [row, col] = ctx.callbackQuery.data.split(":").map(Number);

    if (ctx.session.matrix[row][col])
        return ctx.answerCallbackQuery({text: "*Неправильный ход*"});

    ctx.session.matrix[row][col] = "player"

    if (isWinner(ctx.session.matrix, "player"))
        return ctx.editMessageText("*Вы победили*", {
            reply_markup: startKeyboard
        })

    const computerCell = getAvailableCell(ctx.session.matrix)

    if (!computerCell) return ctx.editMessageText("*Ничья", {
        reply_markup: startKeyboard
    })

    const [x, y] = computerCell

    ctx.session.matrix[x][y] = "computer"

    if (isWinner(ctx.session.matrix, "computer"))
        return ctx.editMessageText("*Вы проиграли*", {
            reply_markup: startKeyboard
        });

    return ctx.editMessageText("*Ход игрока*", {
        reply_markup: matrixToKeyboard(ctx.session.matrix)
    })

})


