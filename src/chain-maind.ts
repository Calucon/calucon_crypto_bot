import { promisify } from "util";
import { exec } from "child_process";
import { timeoutPromise } from "./extensions";
import CONSTANTS from "./constants";
import { sep } from "path";

if (process.env.CHAIN_MAIND_PATH == undefined) {
  throw new Error("CHAIN_MAIND_PATH not defined!");
}
if (process.env.CHAIN_MAIND_NODE == undefined) {
  throw new Error("CHAIN_MAIND_NODE not defined!");
}

const CHAIN_MAIND_PATH = process.env.CHAIN_MAIND_PATH;
const CHAIN_MAIND_NODE = process.env.CHAIN_MAIND_NODE;

const execPromise = promisify(exec);

/**
 * Produces the same output as execPromise
 * @param error
 * @returns
 */
function getError(error: string) {
  return { stdout: "", stderr: error };
}

/**
 * Executes the given command
 * @param command command to execute
 * @returns
 */
async function execute(command: string) {
  try {
    return execPromise(
      `${CHAIN_MAIND_PATH}${sep}chain-maind ${command} --node ${CHAIN_MAIND_NODE} --output json`
    );
  } catch (e) {
    return getError((e as Error).message);
  }
}

//-----------------------------------------------

export async function validatorDetails(
  validatorAddress: string
): Promise<{ stdout: string; stderr: string }> {
  const promise = execute(`query staking validator ${validatorAddress}`);
  return await timeoutPromise(
    CONSTANTS.CHAIN_MAIND_TIMEOUT,
    promise,
    getError("timeout")
  );
}

export async function validatorSlashing(valodatorConsensPublicKey: string) {
  const promise = execute(
    `query slashing signing-info ${valodatorConsensPublicKey}`
  );
  return await timeoutPromise(
    CONSTANTS.CHAIN_MAIND_TIMEOUT,
    promise,
    getError("timeout")
  );
}

/**
 * The ' status' command writes to stderr by detault.
 * Therefore we must modify the default behavior
 * @returns
 */
export async function status() {
  try {
    const promise = execPromise(
      `${CHAIN_MAIND_PATH}${sep}chain-maind status --node ${CHAIN_MAIND_NODE}`
    );
    const result = await timeoutPromise(
      CONSTANTS.CHAIN_MAIND_TIMEOUT,
      promise,
      getError("timeout")
    );

    // status writes to stderr by default...
    if (result.stderr != "timeout") {
      return {
        stdout: result.stderr,
        stderr: "",
      };
    }
    return result;
  } catch (e) {
    return getError((e as Error).message);
  }
}
