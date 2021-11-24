import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import * as cdcApi from "../apis/cdcApi";
import * as cbApi from "../apis/cbApi";

export class CropriceCommand {
  constructor(bot: Telegraf<Context<Update>>) {
    bot.command("croprice", this.run);
  }

  private async run(ctx: Context<Update>) {
    try {
      const messagePromise = ctx.replyWithMarkdown("_Loading prices..._");
      const priceCroCdcPromise = cdcApi.getPrice("CRO_USDC", 5);
      const priceVvsCdcPromise = cdcApi.getPrice("VVS_USDC", 8);
      const priceCroCbPromise = cbApi.getPrice("CRO-USD", 5);

      const message = await messagePromise;
      const croPriceCdc = await priceCroCdcPromise;
      const vvsPriceCdc = await priceVvsCdcPromise;
      const croPriceCb = await priceCroCbPromise;

      ctx.telegram.editMessageText(
        ctx.chat?.id,
        message.message_id,
        undefined,
        [
          "```",
          `[${cdcApi.NAME}]`,
          `CRO - USDC: $${croPriceCdc}`,
          `VVS - USDC: $${vvsPriceCdc}`,
          "",
          `[${cbApi.NAME}]`,
          `CRO - USD: $${croPriceCb}`,
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
