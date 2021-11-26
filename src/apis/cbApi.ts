import rp from "request-promise";
import { timeoutPromise } from "../extensions";
import CONSTANTS from "../constants";

export const NAME = "Coinbase";
const BASE_URL = "https://api.coinbase.com/v2/prices";

export async function queryPriceRaw(ticker: string) {
  const requestOptions = {
    method: "GET",
    uri: BASE_URL + `/${ticker}/spot`,
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
      data: { ammount: "0" },
    });

    const price = queryResult.data.amount;
    return parseFloat(price).toFixed(decimals);
  } catch (e) {
    console.error("error: %o", e);
    return "error";
  }
}
