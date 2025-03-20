import { defineChain } from "viem";

// 定义 Monad 主网
export const monad = defineChain({
  id: 1337,
  name: "Monad",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.monad.xyz"],
    },
    public: {
      http: ["https://rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monadscan",
      url: "https://explorer.monad.xyz",
    },
  },
});

// 定义 Monad 测试网
export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Monad",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
    public: {
      http: ["https://rpc.testnet.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "Monadscan Testnet",
      url: "https://testnet.monadexplorer.com/",
    },
  },
  testnet: true,
});
