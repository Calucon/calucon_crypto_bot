import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";

export class QuitCommand {
  constructor(bot: Telegraf<Context<Update>>) {
    bot.command("quit", (ctx) => ctx.leaveChat());
  }
}

export default function init(bot: Telegraf<Context<Update>>): QuitCommand {
  return new QuitCommand(bot);
}
