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
import {createMatrix, getAvailableCell, isWinner, matrixToKeyboard, startKeyboard} from "./game.mjs";
import {gameTurn} from "./game.turn.mjs";

export const {
    TELEGRAM_BOT_TOKEN: token,
    TELEGRAM_SECRET_TOKEN: secretToken = String(token).split(":").pop()
} = process.env;

export const bot = /** @type {Bot<BotContext>} */ new Bot(token);

const safe = bot.errorBoundary(e => console.error(e));


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

safe.on("callback_query:data", gameTurn)


