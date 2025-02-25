import { ethers } from 'ethers';
import DataStorage from './artifacts/DataStorage.json'; // Ensure this path is correct

// Replace with your deployed contract address
const contractAddress = "0xC44e0a6d50024c1E75e7F9Dfa2a86Bb764C89778"; // Update this with your actual deployed contract address

let provider;
let signer;
let dataStorageContract;

export const initializeWeb3 = async () => {
    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []); // Request account access
        signer = provider.getSigner();

        dataStorageContract = new ethers.Contract(
            contractAddress,
            DataStorage.abi,
            signer
        );

        console.log("Web3 initialized and contract instance created.");
    } else {
        console.error("Please install MetaMask!");
    }
};

export const storeTrafficData = async (ipfsHash) => {
    if (!dataStorageContract) throw new Error("Contract not initialized");

    try {
        const tx = await dataStorageContract.storeTrafficData(ipfsHash);
        await tx.wait(); // Wait for transaction confirmation
        console.log("Traffic Data stored successfully:", ipfsHash);
    } catch (error) {
        console.error("Error storing Traffic Data:", error.message);
    }
};

export const storeAccidentData = async (ipfsHash) => {
    if (!dataStorageContract) throw new Error("Contract not initialized");

    try {
        const tx = await dataStorageContract.storeAccidentData(ipfsHash);
        await tx.wait(); // Wait for transaction confirmation
        console.log("Accident Data stored successfully:", ipfsHash);
    } catch (error) {
        console.error("Error storing Accident Data:", error.message);
    }
};

export const fetchTrafficDataHash = async () => {
    if (!dataStorageContract) throw new Error("Contract not initialized");
    
    try {
      return await dataStorageContract.getTrafficData();
  } catch (error) {
      console.error("Error fetching Traffic Data Hash:", error.message);
  }
};

export const fetchAccidentDataHash = async () => {
  if (!dataStorageContract) throw new Error("Contract not initialized");
  
  try {
      return await dataStorageContract.getAccidentData();
  } catch (error) {
      console.error("Error fetching Accident Data Hash:", error.message);
  }
};
