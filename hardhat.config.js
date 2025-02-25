/** @type import('hardhat/config').HardhatUserConfig */
require("@nomiclabs/hardhat-ethers");
module.exports = {
  defaultNetwork: "development",
  solidity: "0.8.0",
  networks: {
    development: {
        url: "http://127.0.0.1:8545", // Geth local network
        accounts: ["d28621ac8b58c4190ea0d88052a15f7b523ed0a9a9585a9d8a69ce9d9c32fd3c"] // Replace with one of the private keys from Geth
    }
}
};