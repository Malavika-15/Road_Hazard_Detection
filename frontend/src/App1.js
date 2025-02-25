import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import TrafficDataStorage from "./artifacts/TrafficDataStorage.json";

function App() {
  const [ipfsHash, setIpfsHash] = useState("");
  const [message, setMessage] = useState("");
  const [trafficDataStorage, setTrafficDataStorage] = useState(null);
  const [storedData, setStoredData] = useState(""); // State to hold fetched data

  // Function to request account access
  const requestAccount = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("Connected account:", accounts[0]);
      } catch (error) {
        console.error("Error requesting accounts:", error);
        setMessage(`Error requesting accounts: ${error.message}`);
      }
    } else {
      alert("Please install MetaMask!");
      setMessage("Please install MetaMask!");
    }
  };

  useEffect(() => {
    const initializeContract = async () => {
      await requestAccount(); // Request account access
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          "0xDc6BA884DA4aDf0BFD7BF3828bb5D71E31Aa0cFb", // Replace with your contract address
          TrafficDataStorage.abi,
          signer
        );
        setTrafficDataStorage(contract);
        console.log("Contract initialized:", contract);
        console.log("Available functions:", Object.keys(contract.functions)); // Log available functions
      } catch (error) {
        console.error("Error initializing contract:", error);
        setMessage(`Error initializing contract: ${error.message}`);
      }
    };

    initializeContract();
  }, []);

  const storeData = async () => {
    if (!trafficDataStorage) {
      console.error("Contract not initialized.");
      setMessage("Contract not initialized.");
      return;
    }

    try {
      // Fetch content from traffic_data.json
      const response = await fetch("/traffic_data.json"); // Make sure this file is served in your React app's public folder
      const jsonData = await response.json();

      // Call the localhost API to store the JSON content in IPFS
      const apiResponse = await fetch("http://localhost:8080/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      if (!apiResponse.ok) {
        throw new Error(`Error from IPFS API: ${apiResponse.statusText}`);
      }

      const { cid } = await apiResponse.json();
      console.log("Received CID from IPFS:", cid);

      // Store the IPFS hash on the blockchain
      const tx = await trafficDataStorage.storeData(cid, {
        gasLimit: 500000, // Adjust as necessary
      });
      await tx.wait();

      console.log("Data stored in smart contract:", cid);
      setIpfsHash(cid);
      setMessage("Data stored successfully!");
    } catch (error) {
      console.error("Error storing data:", error);
      setMessage(`Error storing data: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await storeData();
  };

  // Function to fetch data from the smart contract
  const fetchData = async () => {
    if (!trafficDataStorage) {
      console.error("Contract not initialized.");
      setMessage("Contract not initialized.");
      return;
    }

    try {
      // Fetch the IPFS hash from the blockchain
      const ipfsHash = await trafficDataStorage.ipfsHash(); // Ensure this matches your contract's function
      console.log("IPFS Hash retrieved from contract:", ipfsHash);

      setStoredData(ipfsHash); // Update state with fetched IPFS hash

      // Fetch the content from IPFS using the localhost API
      const response = await fetch(
        `http://localhost:8080/retrieve/${ipfsHash}`
      );

      if (!response.ok) {
        throw new Error(
          `Error retrieving content from IPFS: ${response.statusText}`
        );
      }

      const content = await response.json();
      console.log("Content retrieved from IPFS:", content);

      // Display the content on the page
      setMessage("Data fetched successfully!");
      setStoredData(JSON.stringify(content, null, 2)); // Convert content to string for display
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage(`Error fetching data: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>My DApp</h1>
      <form onSubmit={handleSubmit}>
        {/* <input
          type="text"
          value={ipfsHash}
          onChange={(e) => setIpfsHash(e.target.value)}
          placeholder="Enter IPFS Hash"
          required
        /> */}
        <button type="submit">Store Data</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={fetchData}>Fetch Stored Data</button>
      {storedData && (
        <div>
          <h3>Retrieved Content:</h3>
          <pre>{storedData}</pre>{" "}
          {/* Use preformatted text to display JSON content */}
        </div>
      )}
    </div>
  );
}

export default App;
