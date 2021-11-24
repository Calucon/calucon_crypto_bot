import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";

export class QuitCommand {
  constructor(bot: Telegraf<Context<Update>>) {
    bot.help(this.run);
  }

  private run(ctx: Context<Update>) {
    ctx.replyWithMarkdown(
      [
        "*Calucon Crypto Bot*",
        "",
        "`/help` - Displays this message",
        "`/validatordetails` - Check Validator Details",
        "`/croprice` - Display CRO price",
      ].join("\n")
    );
  }
}

export default function init(bot: Telegraf<Context<Update>>): QuitCommand {
  return new QuitCommand(bot);
}
