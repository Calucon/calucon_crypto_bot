import { promisify } from "util";
import { exec } from "child_process";
import { timeoutPromise } from "./extensions";
import CONSTANTS from "./constants";

if (process.env.CHAIN_MAIND == undefined) {
  throw new Error("CHAIN_MAIND not defined!");
}
if (process.env.CHAIN_MAIND_NODE == undefined) {
  throw new Error("CHAIN_MAIND_NODE not defined!");
}

const CHAIN_MAIND = process.env.CHAIN_MAIND;
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

async function execute(command: string) {
  try {
    return execPromise(
      `${CHAIN_MAIND} ${command} --node ${CHAIN_MAIND_NODE} --output json`
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

export function validatorSlashing(valodatorConsensPublicKey: string) {
  const promise = execute(
    `query slashing signing-info ${valodatorConsensPublicKey}`
  );
  return timeoutPromise(
    CONSTANTS.CHAIN_MAIND_TIMEOUT,
    promise,
    getError("timeout")
  );
}
