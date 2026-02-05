import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { appConfig } from "./config";

export const createSuiClient = () =>
  new SuiJsonRpcClient({
    network: appConfig.network as any,
    url: getJsonRpcFullnodeUrl(appConfig.network as any),
  });

export const MIST_PER_SUI = 1_000_000_000n;

export const parseSuiToMist = (value: number | string) => {
  const raw = typeof value === "number" ? value.toString() : value;
  const [whole, fraction = ""] = raw.split(".");
  const wholePart = BigInt(whole || "0");
  const fractionPadded = (fraction + "000000000").slice(0, 9);
  const fractionPart = BigInt(fractionPadded || "0");
  return wholePart * MIST_PER_SUI + fractionPart;
};

export const formatMistToSui = (mist: bigint) => {
  const whole = mist / MIST_PER_SUI;
  const fraction = mist % MIST_PER_SUI;
  const fractionStr = fraction.toString().padStart(9, "0").slice(0, 4);
  return `${whole.toString()}.${fractionStr}`;
};
