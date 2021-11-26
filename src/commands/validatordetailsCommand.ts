import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import * as cdcApi from "../apis/cdcApi";
import { validatorDetails, validatorSlashing } from "../chain-maind";
import CACHE from "../chain-maind-cached";

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
      const croPricePromise = cdcApi.getPrice("CRO_USDC", 5);

      const croPriceCdc = await croPricePromise;
      const message = await messagePromise;
      const details = parseDetails(await detailsPromise);

      ctx.telegram.editMessageText(
        ctx.chat?.id,
        message.message_id,
        undefined,
        getSuccessMessage(details, croPriceCdc),
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
function getSuccessMessage(
  details: ValidatorDetails,
  croPrice: string
): string {
  if (details.isError) {
    return "_An error occurred!_";
  } else {
    return [
      `*${details.moniker}*`,
      "",
      "```",
      `CRO Price:      $${croPrice}`,
      `CRO Staked:     ${details.delegated} M`,
      `Jailed:         ${details.jailed}`,
      `Comms Rate:     ${details.comms} %`,
      //`APR:            ${"null"}`,
      `Avg Block Time: ${
        CACHE.avgBlockTime == NaN ? "err" : CACHE.avgBlockTime + "ms"
      }`,
      `Missed Blocks:  ${CACHE.slashing.missedBlocks}`,
      "```",
    ].join("\n");
  }
}

/**
 * Parses validator details
 * @param details
 * @returns
 */
function parseDetails(details: {
  stdout: string;
  stderr: string;
}): ValidatorDetails {
  try {
    if (details.stderr.length == 0) {
      const detailData = JSON.parse(details.stdout);
      return {
        moniker: detailData.description.moniker,
        delegated: (parseInt(detailData.tokens) / Math.pow(10, 14)).toFixed(2),
        comms: (
          parseFloat(detailData.commission.commission_rates.rate) * 100
        ).toFixed(2),
        jailed: detailData.jailed,
        isError: false,
      };
    }
  } catch (e) {
    console.error("error: %o", e);
  }

  return {
    moniker: "Error",
    delegated: "err",
    comms: "err",
    jailed: "unknown",
    isError: true,
  };
}

export default function init(
  bot: Telegraf<Context<Update>>
): ValidatordetailsCommand {
  return new ValidatordetailsCommand(bot);
}

type ValidatorDetails = {
  moniker: string;
  delegated: string;
  comms: string;
  jailed: string;
  isError: boolean;
};
