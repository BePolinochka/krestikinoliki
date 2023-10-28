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

const startKeyboard = new InlineKeyboard().text("Start the Game", "start");

safe.use(session({
    initial: () => ({isGame: false}),
    storage: freeStorage(bot.token),
}));

safe.command("start", ctx =>
    ctx.reply(`Hello!`, {
        reply_markup: startKeyboard
    })
);

safe.callbackQuery("start", async ctx => {
    await ctx.reply("Choose your mark", {
        reply_markup: new InlineKeyboard().text("❌").text("⭕️")
    })
    return ctx.deleteMessage();
})

safe.callbackQuery(["❌", "⭕️"], async ctx => {
    ctx.session.isGame = true;
    ctx.session.matrix = createMatrix()
    ctx.session.symbol = ctx.callbackQuery.data
    await ctx.reply("Game on", {
        reply_markup: matrixToKeyboard(ctx.session.matrix, ctx.session.symbol)
    })
    return ctx.deleteMessage();
})

safe.on("callback_query:data", async (ctx) => {
    // await ctx.answerCallbackQuery({text: ctx.callbackQuery.data});
    const [row, col] = ctx.callbackQuery.data.split(":").map(Number);

    if (ctx.session.matrix[row][col])
        return ctx.answerCallbackQuery({text: "The cell is already filled. Choose another one"});

    ctx.session.matrix[row][col] = "player"

    if (isWinner(ctx.session.matrix, "player"))
        return ctx.editMessageText("You win!", {
            reply_markup: startKeyboard
        })

    const computerCell = getAvailableCell(ctx.session.matrix)

    if (!computerCell) return ctx.editMessageText("Draw", {
        reply_markup: startKeyboard
    })

    const [x, y] = computerCell

    ctx.session.matrix[x][y] = "computer"

    if (isWinner(ctx.session.matrix, "computer"))
        return ctx.editMessageText("You loose!", {
            reply_markup: startKeyboard
        });

    return ctx.editMessageText("Your turn", {
        reply_markup: matrixToKeyboard(ctx.session.matrix, ctx.session.symbol)
    })

})


