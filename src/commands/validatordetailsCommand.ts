import { parse } from "path/posix";
import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import * as cdcApi from "../apis/cdcApi";
import { validatorDetails, validatorSlashing } from "../chain-maind";

if (process.env.VALIDATOR == undefined) {
  throw new Error("VALIDATOR not defined!");
}
if (process.env.VALIDATOR_CONS_PUB_KEY == undefined) {
  throw new Error("VALIDATOR_CONS_PUB_KEY not defined!");
}

const VALIDATOR = process.env.VALIDATOR;
const VALIDATOR_CONS_PUB_KEY = process.env.VALIDATOR_CONS_PUB_KEY;

export class ValidatordetailsCommand {
  constructor(bot: Telegraf<Context<Update>>) {
    bot.command("validatordetails", this.run);
  }

  private async run(ctx: Context<Update>) {
    try {
      const messagePromise = ctx.replyWithMarkdown("_Loading details..._");
      const detailsPromise = validatorDetails(VALIDATOR);
      const slashingPromise = validatorSlashing(VALIDATOR_CONS_PUB_KEY);
      const croPricePromise = cdcApi.getPrice("CRO_USDC", 5);

      const croPriceCdc = await croPricePromise;
      const message = await messagePromise;
      const details = await detailsPromise;
      const slashing = await slashingPromise;

      ctx.telegram.editMessageText(
        ctx.chat?.id,
        message.message_id,
        undefined,
        details.stderr.length > 0 || slashing.stderr.length > 0
          ? this.getErrorMessage()
          : getSuccessMessage(details.stdout, slashing.stdout, croPriceCdc),
        { parse_mode: "Markdown" }
      );
    } catch (e) {
      console.log("error: %o", e);
    }
  }

  private getErrorMessage(): string {
    return "_An error occurred!_";
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
function getSuccessMessage(
  details: string,
  slashing: string,
  croPrice: string
): string {
  const detailData = JSON.parse(details);
  const slashingData = JSON.parse(slashing);

  const delegated = (parseInt(detailData.tokens) / Math.pow(10, 14)).toFixed(2);
  const comms = (
    parseFloat(detailData.commission.commission_rates.rate) * 100
  ).toFixed(2);

  return [
    `*${detailData.description.moniker}*`,
    "",
    "```",
    `CRO Price:      $${croPrice}`,
    `CRO Staked:     ${delegated} M`,
    `Jailed:         ${detailData.jailed}`,
    `Comms Rate:     ${comms} %`,
    `APR:            ${"null"}`,
    `Avg Block Time: ${"null"}`,
    `Missed Blocks:  ${slashingData.missed_blocks_counter}`,
    "```",
  ].join("\n");
}

export default function init(
  bot: Telegraf<Context<Update>>
): ValidatordetailsCommand {
  return new ValidatordetailsCommand(bot);
}
