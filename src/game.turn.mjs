import {getAvailableCell, getAvailableCells, isWinner, matrixToKeyboard, startKeyboard} from "./game.mjs";
import {setTimeout} from 'node:timers/promises';

export const gameTurn = async (ctx) => {

    try {

        const [row, col] = ctx.callbackQuery.data.split(":").map(Number);

        if (ctx.session.matrix[row][col])
            return ctx.answerCallbackQuery({text: "The cell is already filled. Choose another one"});

        ctx.session.matrix[row][col] = "player"

        await ctx.editMessageText("Your turn", {
            reply_markup: matrixToKeyboard(ctx.session.matrix, ctx.session.symbol)
        })

        await setTimeout(1000);

        if (isWinner(ctx.session.matrix, "player"))
            return ctx.editMessageText("You win!", {
                reply_markup: startKeyboard
            })

        if (!getAvailableCells(ctx.session.matrix).length)
            return ctx.editMessageText("Draw", {
            reply_markup: startKeyboard
            }).catch(() => null)

        let x, y;

        do {
            [x, y] = await getAvailableCell(ctx.session.matrix)
        } while (ctx.session.matrix[x][y])

        ctx.session.matrix[x][y] = "computer"

        await ctx.editMessageText("Your turn", {
            reply_markup: matrixToKeyboard(ctx.session.matrix, ctx.session.symbol)
        }).catch(() => null)

        await setTimeout(1000);

        if (isWinner(ctx.session.matrix, "computer"))
            return ctx.editMessageText("You loose!", {
                reply_markup: startKeyboard
            }).catch(() => null);

    } finally {
        await ctx.answerCallbackQuery();
    }

}