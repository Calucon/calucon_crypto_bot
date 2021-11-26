import * as ChainMaind from "./chain-maind";
import { schedule } from "node-cron";

if (process.env.VALIDATOR_CONS_PUB_KEY == undefined) {
  throw new Error("VALIDATOR_CONS_PUB_KEY not defined!");
}
const VALIDATOR_CONS_PUB_KEY = process.env.VALIDATOR_CONS_PUB_KEY;

const CACHE: Cache = {
  state: {
    syncInfo: {
      latestBlockHeight: 0,
      latestBlockTime: Date.parse("2021-04-06"),
      earliestBlockHeight: 0,
      earliestBlockTime: Date.parse("2021-04-06"),
    },
    isError: true,
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
while (!queryStatus()) {
  // retry...
}

schedule("*/5 * * * *", querySlashing).start();
while (!querySlashing()) {
  // retry...
}

//###############################################
//                  Tasks                      ||
//###############################################

async function queryStatus() {
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
        isError: false,
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

async function querySlashing() {
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

//###############################################
//                  Types                      ||
//###############################################

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
  isError: boolean;
};
type Cache = {
  state: State;
  slashing: ValidatorSlashing;
  avgBlockTime: number;
};
