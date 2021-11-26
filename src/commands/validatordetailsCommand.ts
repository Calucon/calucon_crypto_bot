import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import * as cdcApi from "../apis/cdcApi";
import { validatorDetails, validatorSlashing, status } from "../chain-maind";
import { trimNewlines } from "../extensions";

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
      const statePromise = status();
      const croPricePromise = cdcApi.getPrice("CRO_USDC", 5);

      const croPriceCdc = await croPricePromise;
      const message = await messagePromise;
      const details = parseDetails(await detailsPromise);
      const slashing = parseSlashing(await slashingPromise);
      const state = parseState(await statePromise);

      ctx.telegram.editMessageText(
        ctx.chat?.id,
        message.message_id,
        undefined,
        getSuccessMessage(details, slashing, state, croPriceCdc),
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
 * @param status
 * @param croPrice
 * @returns
 */
function getSuccessMessage(
  details: ValidatorDetails,
  slashing: ValidatorSlashing,
  state: State,
  croPrice: string
): string {
  if (details.isError && slashing.isError) {
    return "_An error occurred!_";
  } else {
    var avgBlockTime = "err";
    if (!state.isError) {
      const blockDiff =
        state.syncInfo.latestBlockHeight - state.syncInfo.earliestBlockHeight;
      const timeDiff =
        state.syncInfo.latestBlockTime - state.syncInfo.earliestBlockTime;
      avgBlockTime = Math.round(timeDiff / blockDiff) + "ms";
    }

    return [
      `*${details.moniker}*`,
      "",
      "```",
      `CRO Price:      $${croPrice}`,
      `CRO Staked:     ${details.delegated} M`,
      `Jailed:         ${details.jailed}`,
      `Comms Rate:     ${details.comms} %`,
      //`APR:            ${"null"}`,
      `Avg Block Time: ${avgBlockTime}`,
      `Missed Blocks:  ${slashing.missedBlocks}`,
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

function parseSlashing(slashing: {
  stdout: string;
  stderr: string;
}): ValidatorSlashing {
  try {
    if (slashing.stderr.length == 0) {
      const slashingData = JSON.parse(slashing.stdout);
      return {
        missedBlocks: slashingData.missed_blocks_counter,
        isError: false,
      };
    }
  } catch (e) {
    console.error("error: %o", e);
  }

  return {
    missedBlocks: "err",
    isError: true,
  };
}

function parseState(status: { stdout: string; stderr: string }): State {
  try {
    if (status.stderr.length == 0) {
      const statusData = JSON.parse(trimNewlines(status.stdout));
      return {
        syncInfo: {
          latestBlockHeight: parseInt(statusData.SyncInfo.latest_block_height),
          latestBlockTime: Date.parse(statusData.SyncInfo.latest_block_time),
          earliestBlockHeight: parseInt(
            statusData.SyncInfo.earliest_block_height
          ),
          earliestBlockTime: Date.parse(
            statusData.SyncInfo.earliest_block_time
          ),
        },
        isError: false,
      };
    }
  } catch (e) {
    console.error("error: %o", e);
  }

  return {
    syncInfo: {
      latestBlockHeight: 0,
      latestBlockTime: Date.parse("2021-04-06"),
      earliestBlockHeight: 0,
      earliestBlockTime: Date.parse("2021-04-06"),
    },
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
type ValidatorSlashing = {
  missedBlocks: string;
  isError: boolean;
};
type SyncInfo = {
  latestBlockHeight: number;
  latestBlockTime: number;
  earliestBlockHeight: number;
  earliestBlockTime: number;
};
type State = {
  syncInfo: SyncInfo;
  isError: boolean;
};
