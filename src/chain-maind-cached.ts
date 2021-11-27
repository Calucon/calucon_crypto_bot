import * as ChainMaind from "./chain-maind";
import { schedule } from "node-cron";

if (process.env.VALIDATOR == undefined) {
  throw new Error("VALIDATOR not defined!");
}
if (process.env.VALIDATOR_CONS_PUB_KEY == undefined) {
  throw new Error("VALIDATOR_CONS_PUB_KEY not defined!");
}
const VALIDATOR_CONS_PUB_KEY = process.env.VALIDATOR_CONS_PUB_KEY;
const VALIDATOR = process.env.VALIDATOR;

const CACHE: Cache = {
  state: {
    syncInfo: {
      latestBlockHeight: 0,
      latestBlockTime: Date.parse("2021-04-06"),
      earliestBlockHeight: 0,
      earliestBlockTime: Date.parse("2021-04-06"),
    },
  },
  details: {
    comms: NaN,
    delegated: NaN,
    jailed: "err",
    moniker: "Unknown",
  },
  slashing: {
    missedBlocks: NaN,
  },
  avgBlockTime: NaN,
};
export default CACHE;

//###############################################
//                Cron-Jobs                    ||
//###############################################

schedule("*/5 * * * *", queryStatus).start();
schedule("*/5 * * * *", querySlashing).start();
schedule("*/3 * * * *", queryDetails).start();

export async function populateCache() {
  while (!(await querySlashing())) {
    // retry...
  }
  while (!(await queryStatus())) {
    // retry...
  }
  while (!(await queryDetails())) {
    // retry...
  }
}

//###############################################
//                  Tasks                      ||
//###############################################

/**
 * Update current chain status
 * @returns
 */
async function queryStatus(): Promise<boolean> {
  console.log("[CRON] Querying Chain Status...");
  const status = await ChainMaind.status();
  try {
    if (status.stderr.length == 0) {
      const statusData = JSON.parse(status.stdout);
      CACHE.state = {
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
      };

      const blockDiff =
        CACHE.state.syncInfo.latestBlockHeight -
        CACHE.state.syncInfo.earliestBlockHeight;
      const timeDiff =
        CACHE.state.syncInfo.latestBlockTime -
        CACHE.state.syncInfo.earliestBlockTime;
      CACHE.avgBlockTime = Math.round(timeDiff / blockDiff);
    }
    return true;
  } catch (e) {
    console.error("[CRON] Querying Chain Status Error: %o", e);
  }
  return false;
}

/**
 * Update validator slashing details
 * @returns
 */
async function querySlashing(): Promise<boolean> {
  console.log("[CRON] Querying Validator Slashing...");
  const slashing = await ChainMaind.validatorSlashing(VALIDATOR_CONS_PUB_KEY);
  try {
    if (slashing.stderr.length == 0) {
      const slashingData = JSON.parse(slashing.stdout);
      CACHE.slashing = {
        missedBlocks: slashingData.missed_blocks_counter,
      };
      return true;
    }
  } catch (e) {
    console.error("[CRON] Querying Validator Slashing Error: %o", e);
  }
  return false;
}

/**
 * Update general validator details
 * @returns
 */
async function queryDetails(): Promise<boolean> {
  console.log("[CRON] Querying Validator Details...");
  const details = await ChainMaind.validatorDetails(VALIDATOR);
  try {
    if (details.stderr.length == 0) {
      const detailData = JSON.parse(details.stdout);
      CACHE.details = {
        moniker: detailData.description.moniker,
        delegated: parseInt(detailData.tokens) / Math.pow(10, 14),
        comms: parseFloat(detailData.commission.commission_rates.rate) * 100,
        jailed: detailData.jailed,
      };
    }
    return true;
  } catch (e) {
    console.error("[CRON] Querying Validator Details Error: %o", e);
  }
  return false;
}

//###############################################
//                  Types                      ||
//###############################################

type ValidatorDetails = {
  moniker: string;
  delegated: number;
  comms: number;
  jailed: string;
};
type ValidatorSlashing = {
  missedBlocks: number;
};
type SyncInfo = {
  latestBlockHeight: number;
  latestBlockTime: number;
  earliestBlockHeight: number;
  earliestBlockTime: number;
};
type State = {
  syncInfo: SyncInfo;
};
type Cache = {
  state: State;
  details: ValidatorDetails;
  slashing: ValidatorSlashing;
  avgBlockTime: number;
};
