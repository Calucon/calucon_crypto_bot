import rp from "request-promise";

export const NAME = "Coinbase";
const BASE_URL = "https://api.coinbase.com/v2/prices";

export function prices(ticker: string) {
  const requestOptions = {
    method: "GET",
    uri: BASE_URL + `/${ticker}/spot`,
    json: true,
    gzip: true,
  };

  return rp(requestOptions);
}
