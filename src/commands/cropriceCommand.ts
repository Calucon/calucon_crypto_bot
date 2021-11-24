import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import * as cmcApi from "../apis/cmcApi";

export class CropriceCommand {
  constructor(bot: Telegraf<Context<Update>>) {
    bot.command("croprice", this.run);
  }

  private async run(ctx: Context<Update>) {
    const messagePromise = ctx.replyWithMarkdown("_Loading prices..._");
    const pricePromise = cmcApi.prices(["CRO", "VVS"]);

    const message = await messagePromise;
    const prices = await pricePromise;

    const croPrice = parseFloat(prices.data.CRO.quote.USD.price).toFixed(5);
    const vvsPrice = parseFloat(prices.data.VVS.quote.USD.price).toFixed(8);

    ctx.telegram.editMessageText(
      ctx.chat?.id,
      message.message_id,
      undefined,
      ["```", `CRO - USD: $${croPrice}`, `VVS - USD: $${vvsPrice}`, "```"].join(
        "\n"
      ),
      { parse_mode: "Markdown" }
    );
  }
}

export default function init(bot: Telegraf<Context<Update>>): CropriceCommand {
  return new CropriceCommand(bot);
}
