import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import PAIRS, { Pair } from "../config/pairsConfig";
import * as cdcApi from "../apis/cdcApi";
import * as cbApi from "../apis/cbApi";

export class CropriceCommand {
  constructor(bot: Telegraf<Context<Update>>) {
    bot.command("croprice", this.run);
  }

  private async run(ctx: Context<Update>) {
    try {
      const messagePromise = ctx.replyWithMarkdown("_Loading prices..._");

      const promises: PromiseList = {
        CDC: new Map(),
        CB: new Map(),
      };
      PAIRS.CDC.forEach((it) => {
        promises.CDC.set(
          it,
          cdcApi.getPrice(`${it.coinA}_${it.coinB}`, it.decimals)
        );
      });
      PAIRS.CB.forEach((it) => {
        promises.CB.set(
          it,
          cbApi.getPrice(`${it.coinA}-${it.coinB}`, it.decimals)
        );
      });

      const cdcArr = [];
      const cbArr = [];
      for (var entry of promises.CDC.entries()) {
        cdcArr.push(`${entry[0].coinA} - ${entry[0].coinB}: ${await entry[1]}`);
      }
      for (var entry of promises.CB.entries()) {
        cbArr.push(`${entry[0].coinA} - ${entry[0].coinB}: ${await entry[1]}`);
      }

      const message = await messagePromise;
      ctx.telegram.editMessageText(
        ctx.chat?.id,
        message.message_id,
        undefined,
        [
          "```",
          `[${cdcApi.NAME}]`,
          cdcArr.join("\n"),
          "",
          `[${cbApi.NAME}]`,
          cbArr.join("\n"),
          "```",
        ].join("\n"),
        { parse_mode: "Markdown" }
      );
    } catch (e) {
      console.error("error: %o", e);
    }
  }
}

export default function init(bot: Telegraf<Context<Update>>): CropriceCommand {
  return new CropriceCommand(bot);
}

type PromiseList = {
  CB: Map<Pair, Promise<string>>;
  CDC: Map<Pair, Promise<string>>;
};
