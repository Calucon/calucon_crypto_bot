import rp from "request-promise";
import { timeoutPromise } from "../extensions";
import CONSTANTS from "../constants";

if (process.env.CDC_API_KEY == undefined) {
  throw new Error("CDC_API_KEY not defined!");
}

export const NAME = "Crypto.com Exchange";
const API_KEY = process.env.CDC_API_KEY;
const BASE_URL = "https://api.crypto.com/v2";

export async function queryPriceRaw(ticker: string) {
  const requestOptions = {
    method: "GET",
    uri:
      BASE_URL +
      `/public/get-ticker?api_key=${API_KEY}&instrument_name=${ticker}`,
    json: true,
    gzip: true,
  };

  return rp(requestOptions);
}

export async function getPrice(
  ticker: string,
  decimals: number
): Promise<string> {
  try {
    const query = queryPriceRaw(ticker);
    const queryResult = await timeoutPromise(CONSTANTS.CDC_API_TIMEOUT, query, {
      result: { data: { b: "0" } },
    });

    const price = queryResult.result.data;
    return parseFloat(price.b).toFixed(decimals);
  } catch (e) {
    console.error("error: %o", e);
    return "error";
  }
}
