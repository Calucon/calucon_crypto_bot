import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import CONSTANTS from "../constants";

export class QuitCommand {
  constructor(bot: Telegraf<Context<Update>>) {
    bot.help(this.run);
  }

  private run(ctx: Context<Update>) {
    ctx.replyWithMarkdown(
      [
        "*Calucon Crypto Bot*",
        "",
        "`/help` - Displays help message",
        "`/validatordetails` - Check Validator Details",
        "`/croprice` - Display CRO price",
        "",
        "*Timeouts:*",
        ` - \`Chain-Maind:    ${(
          CONSTANTS.CHAIN_MAIND_TIMEOUT / 1000
        ).toLocaleString("en-US")}s\``,
        ` - \`Crypto.com API: ${(
          CONSTANTS.CDC_API_TIMEOUT / 1000
        ).toLocaleString("en-US")}s\``,
        ` - \`Coinbase API:   ${(
          CONSTANTS.CB_API_TIMEOUT / 1000
        ).toLocaleString("en-US")}s\``,
      ].join("\n")
    );
  }
}

export default function init(bot: Telegraf<Context<Update>>): QuitCommand {
  return new QuitCommand(bot);
}
