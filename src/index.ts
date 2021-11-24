import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();
if (process.env.BOT_TOKEN === undefined) {
  throw new Error("Bot Token missing!");
}
const bot = new Telegraf(process.env.BOT_TOKEN!!);

bot.command("quit", (ctx) => {
  // Explicit usage
  ctx.telegram.leaveChat(ctx.message.chat.id);

  // Using context shortcut
  ctx.leaveChat();
});

bot.start((ctx) => ctx.reply("Hello"));
bot.help((ctx) => ctx.reply("Help message"));
bot.on("message", (ctx) =>
  ctx.telegram.copyMessage(
    ctx.message.chat.id,
    ctx.message.chat.id,
    ctx.message.message_id
  )
);
bot.action("delete", (ctx) => ctx.deleteMessage());

bot.launch();
console.log("Bot launched!");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
