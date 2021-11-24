import rp from "request-promise";

if (process.env.CMC_API_KEY == undefined) {
  throw new Error("CMC_API_KEY not defined!");
}

export const NAME = "CoinMarketCap";
const API_KEY = process.env.CMC_API_KEY;
const BASE_URL = "https://pro-api.coinmarketcap.com/v1";

export function prices(symbols: string[]) {
  const requestOptions = {
    method: "GET",
    uri: BASE_URL + `/cryptocurrency/quotes/latest?symbol=${symbols.join(",")}`,
    qs: {
      //start: "1",
      //limit: "5000",
      convert: "USD",
    },
    headers: {
      "X-CMC_PRO_API_KEY": API_KEY,
    },
    json: true,
    gzip: true,
  };

  return rp(requestOptions);
}
