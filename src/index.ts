import { Telegraf } from "telegraf";
import dotenv from "dotenv";

dotenv.config();
if (process.env.BOT_TOKEN === undefined) {
  throw new Error("Bot Token missing!");
}
const bot = new Telegraf(process.env.BOT_TOKEN!!);

// import commands
import helpCommand from "./commands/helpCommand";
import cropriceCommand from "./commands/cropriceCommand";
import validatordetailsCommand from "./commands/validatordetailsCommand";

// register commands
helpCommand(bot);
cropriceCommand(bot);
validatordetailsCommand(bot);

// can not import cache before dotenv.config() has run
import { populateCache } from "./chain-maind-cached";

// main application entry point
(async function launch() {
  console.log("Preparing Cache...");
  await populateCache();
  bot.launch();
  console.log("Bot launched!");
}.call(null));

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
