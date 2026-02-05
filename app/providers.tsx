"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { getJsonRpcFullnodeUrl, SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { DAppKitReadyContext } from "./lib/dappkit";

const SUPPORTED_NETWORKS = ["devnet", "testnet", "mainnet", "localnet"] as const;
type Network = (typeof SUPPORTED_NETWORKS)[number];

const resolveNetwork = (): Network => {
  const raw =
    process.env.NEXT_PUBLIC_SUI_NETWORK?.toLowerCase().trim() ?? "testnet";
  if (SUPPORTED_NETWORKS.includes(raw as Network)) {
    return raw as Network;
  }
  return "testnet";
};

export default function Providers({ children }: PropsWithChildren) {
  const [dAppKit, setDAppKit] = useState<any>(null);
  const [Provider, setProvider] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const [{ createDAppKit }, { DAppKitProvider }] = await Promise.all([
        import("@mysten/dapp-kit-core"),
        import("@mysten/dapp-kit-react"),
      ]);

      const defaultNetwork = resolveNetwork();
      const instance = createDAppKit({
        networks: [...SUPPORTED_NETWORKS],
        defaultNetwork,
        autoConnect: true,
        enableBurnerWallet:
          process.env.NEXT_PUBLIC_ENABLE_BURNER === "true",
        createClient: (network) =>
          new SuiJsonRpcClient({
            network,
            url: getJsonRpcFullnodeUrl(network),
          }),
        slushWalletConfig: {
          appName: "StreamPay",
        },
      });

      if (mounted) {
        setDAppKit(instance);
        setProvider(() => DAppKitProvider);
      }
    };

    init();
    return () => {
      mounted = false;
    };
  }, []);

  if (!Provider || !dAppKit) {
    return (
      <DAppKitReadyContext.Provider value={false}>
        {children}
      </DAppKitReadyContext.Provider>
    );
  }

  return (
    <DAppKitReadyContext.Provider value={true}>
      <Provider dAppKit={dAppKit}>{children}</Provider>
    </DAppKitReadyContext.Provider>
  );
}
