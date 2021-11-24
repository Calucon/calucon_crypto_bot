import rp from "request-promise";

if (process.env.CDC_API_KEY == undefined) {
  throw new Error("CDC_API_KEY not defined!");
}

export const NAME = "Crypto.com Exchange";
const API_KEY = process.env.CDC_API_KEY;
const BASE_URL = "https://api.crypto.com/v2";

export function prices(ticker: string) {
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