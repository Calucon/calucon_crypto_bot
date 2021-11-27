import fs from "fs";

const CONFIG_FILE = "pairs.json";

export type Pair = {
  coinA: string;
  coinB: string;
  decimals: number;
};
type Pairs = {
  CB: Array<Pair>;
  CDC: Array<Pair>;
};
export enum Type {
  Coinbase,
  CryptoCom,
}
const PAIRS: Pairs = {
  CB: [],
  CDC: [],
};
export default PAIRS;

//###############################################
//                  Setup                      ||
//###############################################

function initialize() {
  if (fs.existsSync(CONFIG_FILE)) {
    const fileContent = fs.readFileSync(CONFIG_FILE);
    const fileData = JSON.parse(fileContent.toString());
    PAIRS.CB = fileData.CB;
    PAIRS.CDC = fileData.CDC;
    console.log("[PAIRS] Loaded Pairs for CB: %o", PAIRS.CB);
    console.log("[PAIRS] Loaded Pairs for CDC: %o", PAIRS.CDC);
  } else {
    save();
  }
}
initialize();

function save() {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(PAIRS));
}

//###############################################
//                  Setup                      ||
//###############################################

export function addPair(
  type: Type,
  coinA: string,
  coinB: string,
  decimals: number
) {
  var pairArr: Array<Pair> = [];
  switch (type) {
    case Type.Coinbase:
      pairArr = PAIRS.CB;
      break;
    case Type.CryptoCom:
      pairArr = PAIRS.CDC;
      break;
  }

  const existingPair = existsPair(pairArr, coinA, coinB);
  if (existingPair) {
    existingPair.decimals = decimals;
  } else {
    pairArr.push({
      coinA: coinA,
      coinB: coinB,
      decimals: Math.round(decimals),
    });
  }
  save();
}

export function removePair(type: Type, coinA: string, coinB: string) {
  const filterFunc = (it: Pair) => it.coinA != coinA || it.coinB != coinB;

  switch (type) {
    case Type.Coinbase:
      PAIRS.CB = PAIRS.CB.filter(filterFunc);
      break;
    case Type.CryptoCom:
      PAIRS.CDC = PAIRS.CDC.filter(filterFunc);
      break;
  }
  save();
}

//###############################################
//                  Utils                      ||
//###############################################

function existsPair(
  pairs: Array<Pair>,
  coinA: string,
  coinB: string
): Pair | undefined {
  return pairs.find((it) => it.coinA == coinA && it.coinB == coinB);
}

export function getType(typeStr: string): Type {
  switch (typeStr) {
    case "CB":
      return Type.Coinbase;
    case "CDC":
      return Type.CryptoCom;
    default:
      throw new Error(`unknown type '${typeStr}'`);
  }
}

export function toTelegramCB(): string {
  return toTelegram("Coinbase", PAIRS.CB);
}
export function toTelegramCDC(): string {
  return toTelegram("Crypto.com", PAIRS.CDC);
}

function toTelegram(name: String, pairs: Array<Pair>) {
  return [
    `[${name}]`,
    pairs.map((it) => `${it.coinA} - ${it.coinB} [${it.decimals}]`).join("\n"),
  ].join("\n");
}
