import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();
if (process.env.BOT_TOKEN === undefined) {
  throw new Error("Bot Token missing!");
}
const bot = new Telegraf(process.env.BOT_TOKEN!!);

// import commands
import quitCommand from "./commands/quitCommand";
import helpCommand from "./commands/helpCommand";
import cropriceCommand from "./commands/cropriceCommand";
import validatordetailsCommand from "./commands/validatordetailsCommand";

// quitCommand(bot);
helpCommand(bot);
cropriceCommand(bot);
validatordetailsCommand(bot);

bot.launch();
console.log("Bot launched!");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
