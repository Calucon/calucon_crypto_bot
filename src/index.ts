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

// quitCommand(bot);
helpCommand(bot);
cropriceCommand(bot);

bot.launch();
console.log("Bot launched!");

import * as cmcApi from "./apis/cmcApi";

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
