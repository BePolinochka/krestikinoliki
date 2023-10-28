/**
 * @typedef {import("grammy").Context} Context
 * @typedef {import("@grammyjs/types").Chat} Chat
 * @typedef {import("grammy").SessionFlavor} SessionFlavor
 *
 * @typedef {{isGame: boolean, matrix: Array<Array<string>>} & Chat} SessionData
 * @typedef {Context & SessionFlavor<SessionData>} BotContext
 */

import {Bot, InlineKeyboard, session} from "grammy";
import {freeStorage} from "@grammyjs/storage-free";
import {createMatrix, getAvailableCell, isWinner, matrixToKeyboard} from "./game.mjs";

export const {
    TELEGRAM_BOT_TOKEN: token,
    TELEGRAM_SECRET_TOKEN: secretToken = String(token).split(":").pop()
} = process.env;

export const bot = /** @type {Bot<BotContext>} */ new Bot(token);

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

safe.callbackQuery("start", async ctx => {
    ctx.session.isGame = true;
    ctx.session.matrix = createMatrix()
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


