import {getAvailableCell, isWinner, matrixToKeyboard, startKeyboard} from "./game.mjs";
import {setTimeout} from 'node:timers/promises';


export const gameTurn = async (ctx) => {
    // await ctx.answerCallbackQuery({text: ctx.callbackQuery.data});
    const [row, col] = ctx.callbackQuery.data.split(":").map(Number);

    if (ctx.session.matrix[row][col])
        return ctx.answerCallbackQuery({text: "The cell is already filled. Choose another one"});

    ctx.session.matrix[row][col] = "player"

    if (isWinner(ctx.session.matrix, "player"))
        return ctx.editMessageText("You win!", {
            reply_markup: startKeyboard
        })

    await ctx.editMessageText("Your turn", {
        reply_markup: matrixToKeyboard(ctx.session.matrix, ctx.session.symbol)
    })
    await setTimeout(1000);

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

}