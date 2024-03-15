require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    bsc: {
      url: "https://purple-empty-road.bsc-testnet.quiknode.pro/ec72708b9e7ed4646b9086b5f9350f813af9988a/",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
