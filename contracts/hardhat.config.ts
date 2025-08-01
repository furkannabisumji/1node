import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const privateKey = vars.get("WALLET_KEY");
const etherscanApiKey = vars.get("ETHERSCAN_API_KEY");
const alchemyApiKey = vars.get("ALCHEMY_API_KEY");
const ankrApiKey = vars.get("ANKR_API_KEY");
const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    optimism: {
      url: `https://opt-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
      accounts: [privateKey],
      chainId: 10,
    },
    etherlink: {
      url: `https://rpc.ankr.com/etherlink_mainnet/${ankrApiKey}`,
      accounts: [privateKey],
      chainId: 42793,
    },
  },
  etherscan: {
    apiKey: etherscanApiKey,
  },
};

export default config;
