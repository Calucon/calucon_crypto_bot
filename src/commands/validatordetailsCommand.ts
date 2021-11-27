import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import * as cdcApi from "../apis/cdcApi";
import { validatorDetails, validatorSlashing } from "../chain-maind";
import CACHE from "../chain-maind-cached";

export class ValidatordetailsCommand {
  constructor(bot: Telegraf<Context<Update>>) {
    bot.command("validatordetails", this.run);
  }

  private async run(ctx: Context<Update>) {
    try {
      const messagePromise = ctx.replyWithMarkdown("_Loading details..._");
      const croPricePromise = cdcApi.getPrice("CRO_USDC", 5);

      const croPriceCdc = await croPricePromise;
      const message = await messagePromise;

      ctx.telegram.editMessageText(
        ctx.chat?.id,
        message.message_id,
        undefined,
        getSuccessMessage(croPriceCdc),
        { parse_mode: "Markdown" }
      );
    } catch (e) {
      console.error("error: %o", e);
    }
  }
}

/**
 * When putting this function into the class I get an error stating:
 * could not read getSuccessMessage of undefined.
 * No idead what causes this so this method is now placed here
 *
 * @param details
 * @param slashing
 * @param croPrice
 * @returns
 */
function getSuccessMessage(croPrice: string): string {
  return [
    `*${CACHE.details.moniker}*`,
    "",
    "```",
    `CRO Price:      $${croPrice}`,
    `CRO Staked:     ${CACHE.details.delegated.toFixed(2)} M`,
    `Jailed:         ${CACHE.details.jailed}`,
    `Comms Rate:     ${CACHE.details.comms.toFixed(2)} %`,
    //`APR:            ${"null"}`,
    `Avg Block Time: ${
      CACHE.avgBlockTime == NaN ? "err" : CACHE.avgBlockTime + "ms"
    }`,
    `Missed Blocks:  ${CACHE.slashing.missedBlocks}`,
    "```",
  ].join("\n");
}

export default function init(
  bot: Telegraf<Context<Update>>
): ValidatordetailsCommand {
  return new ValidatordetailsCommand(bot);
}
