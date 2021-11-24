import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import * as cdcApi from "../apis/cdcApi";
import * as cbApi from "../apis/cbApi";

export class CropriceCommand {
  constructor(bot: Telegraf<Context<Update>>) {
    bot.command("croprice", this.run);
  }

  private async run(ctx: Context<Update>) {
    const messagePromise = ctx.replyWithMarkdown("_Loading prices..._");
    const priceCroCdcPromise = cdcApi.prices("CRO_USDC");
    const priceVvsCdcPromise = cdcApi.prices("VVS_USDC");
    const priceCroCbPromise = cbApi.prices("CRO-USD");

    const message = await messagePromise;
    const priceCroCdc = (await priceCroCdcPromise).result.data;
    const priceVvsCdc = (await priceVvsCdcPromise).result.data;
    const priceCroCb = (await priceCroCbPromise).data;

    const croPriceCdc = parseFloat(priceCroCdc.b).toFixed(5);
    const croPriceCb = parseFloat(priceCroCb.amount).toFixed(5);
    const vvsPriceCdc = parseFloat(priceVvsCdc.b).toFixed(8);

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
  }
}

export default function init(bot: Telegraf<Context<Update>>): CropriceCommand {
  return new CropriceCommand(bot);
}
