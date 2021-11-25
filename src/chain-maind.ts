import { promisify } from "util";
import { exec } from "child_process";

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
 * @param e
 * @returns
 */
async function getError(e: Error) {
  return { stdout: "", stderr: e.message };
}

function execute(command: string) {
  try {
    return execPromise(
      `${CHAIN_MAIND} ${command} --node ${CHAIN_MAIND_NODE} --output json`
    );
  } catch (e) {
    return getError(e as Error);
  }
}

//-----------------------------------------------

export function validatorDetails(validatorAddress: string) {
  return execute(`query staking validator ${validatorAddress}`);
}

export function validatorSlashing(valodatorConsensPublicKey: string) {
  return execute(`query slashing signing-info ${valodatorConsensPublicKey}`);
}
