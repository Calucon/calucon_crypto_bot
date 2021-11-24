import rp from "request-promise";

export const NAME = "Coinbase";
const BASE_URL = "https://api.coinbase.com/v2/prices";

export function queryPriceRaw(ticker: string) {
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
    const queryResult = await queryPriceRaw(ticker);
    const price = queryResult.data.amount;
    return parseFloat(price).toFixed(decimals);
  } catch (e) {
    console.error("error: %o", e);
    return "error";
  }
}
