import { promisify } from "util";
import { exec } from "child_process";
import { stderr } from "process";

if (process.env.CHAIN_MAIND == undefined) {
  throw new Error("CHAIN_MAIND not defined!");
}
if (process.env.CHAIN_MAIND_NODE == undefined) {
  throw new Error("CHAIN_MAIND_NODE not defined!");
}

const CHAIN_MAIND = process.env.CHAIN_MAIND;
const CHAIN_MAIND_NODE = process.env.CHAIN_MAIND_NODE;

const execPromise = promisify(exec);

export function details(validator: string) {
  try {
    return execPromise(
      `${CHAIN_MAIND} query staking validator ${validator} --node ${CHAIN_MAIND_NODE} --output json`
    );
  } catch (e) {
    return getError(e as Error);
  }
}

async function getError(e: Error) {
  return { stdout: "", stderr: e.message };
}
