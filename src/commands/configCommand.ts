import { Context, Telegraf } from "telegraf";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import {
  addPair,
  removePair,
  toTelegramCB,
  toTelegramCDC,
  getType,
} from "../config/pairsConfig";

export class ConfigCommand {
  constructor(bot: Telegraf<Context<Update>>) {
    bot.hears(/^\/config(.*)$/, this.run.bind(this));
  }

  private async run(ctx: Context<Update> & { match: RegExpExecArray }) {
    try {
      const messagePromise = ctx.replyWithMarkdown("_Configuring..._");
      // match array can not be empty as regex will at least return an empty string
      const match = ctx.match[1].trim().toLowerCase().split(" ");

      switch (match[0]) {
        case "pair":
          this.pair(ctx, messagePromise, match);
          break;
        default:
          this.help(ctx, messagePromise);
      }
    } catch (e) {
      console.error("error: %o", e);
    }
  }

  private async pair(
    ctx: Context<Update>,
    messagePromise: Promise<Message.TextMessage>,
    match: string[]
  ) {
    // no additional parameter given
    if (match.length < 2) {
      this.help(ctx, messagePromise);
      return;
    }

    switch (match[1]) {
      case "list":
        this.list(ctx, messagePromise);
        break;
      case "add":
        this.add(ctx, messagePromise, match);
        break;
      case "remove":
        this.remove(ctx, messagePromise, match);
        break;
      default:
        this.help(ctx, messagePromise);
        break;
    }
  }

  private async list(
    ctx: Context<Update>,
    messagePromise: Promise<Message.TextMessage>
  ) {
    const message = await messagePromise;

    ctx.telegram.editMessageText(
      ctx.chat?.id,
      message.message_id,
      undefined,
      [
        "*Available Pairs:*",
        "",
        "```",
        toTelegramCDC(),
        "",
        toTelegramCB(),
        "```",
      ].join("\n"),
      { parse_mode: "Markdown" }
    );
  }

  private async add(
    ctx: Context<Update>,
    messagePromise: Promise<Message.TextMessage>,
    match: string[]
  ) {
    if (match.length < 6) {
      this.help(ctx, messagePromise);
      return;
    }

    try {
      const exc = getType(match[2].toUpperCase());
      const coinA = match[3].toUpperCase();
      const coinB = match[4].toUpperCase();
      const dec = parseInt(match[5]);
      addPair(exc, coinA, coinB, dec);

      const message = await messagePromise;
      ctx.telegram.editMessageText(
        ctx.chat?.id,
        message.message_id,
        undefined,
        ["*Pair added!*", `\`${coinA} - ${coinB} [${dec}]\``].join("\n"),
        { parse_mode: "Markdown" }
      );
    } catch (e) {
      console.error("error: %o", e);
      this.invalidInput(ctx, messagePromise);
    }
  }

  private async remove(
    ctx: Context<Update>,
    messagePromise: Promise<Message.TextMessage>,
    match: string[]
  ) {
    if (match.length < 5) {
      this.help(ctx, messagePromise);
      return;
    }

    try {
      const exc = getType(match[2].toUpperCase());
      const coinA = match[3].toUpperCase();
      const coinB = match[4].toUpperCase();
      removePair(exc, coinA, coinB);

      const message = await messagePromise;
      ctx.telegram.editMessageText(
        ctx.chat?.id,
        message.message_id,
        undefined,
        ["*Pair removed!*", `\`${coinA} - ${coinB}\``].join("\n"),
        { parse_mode: "Markdown" }
      );
    } catch (e) {
      console.error("error: %o", e);
      this.invalidInput(ctx, messagePromise);
    }
  }

  private async help(
    ctx: Context<Update>,
    messagePromise: Promise<Message.TextMessage>
  ) {
    const message = await messagePromise;
    ctx.telegram.editMessageText(
      ctx.chat?.id,
      message.message_id,
      undefined,
      [
        "*Available Options:*",
        "",
        "List all pairs",
        "`/config pair list`",
        "",
        "Add pair",
        "`/config pair add {exc} {coinA} {coinB} {dec}`",
        "- `{exc}` => CB (Coinbase) or CDC (Crypto.com)",
        "- `{coinA}` => e.g. CRO",
        "- `{coinB}` => e.g. USDC",
        "- `{dec}` => number of decimal places",
        "",
        "Remove pair",
        "`/config pair remove {exc} {coinA} {coinB}`",
        "- `{exc}` => CB (Coinbase) or CDC (Crypto.com)",
        "- `{coinA}` => e.g. CRO",
        "- `{coinB}` => e.g. USDC",
      ].join("\n"),
      { parse_mode: "Markdown" }
    );
  }

  private async invalidInput(
    ctx: Context<Update>,
    messagePromise: Promise<Message.TextMessage>
  ) {
    const message = await messagePromise;
    ctx.telegram.editMessageText(
      ctx.chat?.id,
      message.message_id,
      undefined,
      "_Invalid input!_",
      { parse_mode: "Markdown" }
    );
  }
}

export default function init(bot: Telegraf<Context<Update>>): ConfigCommand {
  return new ConfigCommand(bot);
}
