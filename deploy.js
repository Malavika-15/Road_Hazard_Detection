const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners(); 

    console.log("Deploying contracts with the account:", deployer.address);

    const balance = await deployer.getBalance();
    console.log("Account balance:", ethers.utils.formatEther(balance), "ETH");

    // Change this line to reference your DataStorage contract
    const DataStorage = await ethers.getContractFactory("DataStorage");
    
    // Deploying DataStorage contract
    const dataStorage = await DataStorage.deploy();
    await dataStorage.deployed();

    console.log("DataStorage deployed to:", dataStorage.address);
}

// Execute the main function and handle errors
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
