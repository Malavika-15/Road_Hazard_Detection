//App.js
import React, { useState, useEffect } from "react";
import "./App.css";
// import close from "./close.png";
import axios from "axios";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DataStorage from "./artifacts/DataStorage.json"; // Make sure this points to your compiled contract ABI
import CryptoJS from 'crypto-js'; // Use crypto-js for hashing

function App() {
  const [lane, setLane] = useState("");
  const [laneName, setLaneName] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [message, setMessage] = useState("");
  const [dataStorage, setDataStorage] = useState(null);
  const [isDataStored, setIsDataStored] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");  // Add state for IPFS hash
  const [trafficIpfsHash, setTrafficIpfsHash] = useState("");
  const [accidentIpfsHash, setAccidentIpfsHash] = useState("");
  const [storedTrafficData, setStoredTrafficData] = useState(null);
  const [storedAccidentData, setStoredAccidentData] = useState([]);
  const [showMoreTraffic, setShowMoreTraffic] = useState(false);
  const [showMoreAccident, setShowMoreAccident] = useState(false);
  const [showTrafficPopup, setShowTrafficPopup] = useState(false);
  const [showAccidentPopup, setShowAccidentPopup] = useState(false);


  // Example traffic and accident data (replace with actual fetched data)
  const trafficData = storedTrafficData || [];
  const accidentData = storedAccidentData || [];
  // Assuming `trafficData` is the array containing your stored data
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 1;

  // Function to handle loading more items
  const handleLoadMore = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  // Calculate current items to display
  const currentItems = trafficData.slice(0, (currentPage + 1) * itemsPerPage);


  const CONTRACT_ADDRESS = "0x8314A07167002C1fb61CE579455E43035B12d62d"; // Replace with your contract address

  // Function to request account access
  const requestAccount = async () => {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
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
        const provider = new ethers.BrowserProvider(window.ethereum); // Updated line
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
            CONTRACT_ADDRESS, // Replace with your contract address
            DataStorage.abi,
            signer
          );
        setDataStorage(contract);
        console.log("Contract initialized:", contract);
      } catch (error) {
        console.error("Error initializing contract:", error);
        setMessage(`Error initializing contract: ${error.message}`);
      }
    };

    initializeContract();

  }, []);

  // Function to store Traffic Data
  const storeTrafficData = async () => {
    if (!dataStorage) return;

    try {
        const response = await fetch("/traffic_data.json");
        const jsonData = await response.json();

        const apiResponse = await fetch("http://localhost:8080/storeTraffic", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonData),
        });

        if (!apiResponse.ok) throw new Error(`Error from IPFS API: ${apiResponse.statusText}`);

        const { cid } = await apiResponse.json();
        console.log("Received Traffic CID from IPFS:", cid);

        const tx = await dataStorage.storeTrafficDataIPFS(cid);
        //const tx = await dataStorage.storeTrafficDataIPFS(cid, { gasLimit: 500000 });
        await tx.wait();

        setTrafficIpfsHash(cid);
        setMessage("Traffic Data stored successfully!");
    } catch (error) {
        console.error("Error storing Traffic Data:", error);
        setMessage(`Error storing Traffic Data: ${error.message}`);
    }
  };

  // Function to store Accident Data
  const storeAccidentData = async () => {
    if (!dataStorage) return;

    try {
        const response = await fetch("/event_logs.json");
        const jsonData = await response.json();

        const apiResponse = await fetch("http://localhost:8080/storeAccident", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonData),
        });

        if (!apiResponse.ok) throw new Error(`Error from IPFS API: ${apiResponse.statusText}`);

        const { cid } = await apiResponse.json();
        console.log("Received Accident CID from IPFS:", cid);

        const tx = await dataStorage.storeAccidentData(cid);
        await tx.wait();

        setAccidentIpfsHash(cid);
        setMessage("Accident Data stored successfully!");
    } catch (error) {
        console.error("Error storing Accident Data:", error);
        setMessage(`Error storing Accident Data: ${error.message}`);
    }
  };

  // Function to fetch Traffic Data
  const fetchTrafficData = async () => {
    if (!dataStorage) return;

    try {
        const ipfsHash = await dataStorage.getTrafficDataIPFS();
        if (!ipfsHash || ipfsHash === "0x" || ipfsHash === "") {
            setMessage("No Traffic Data found.");
            return;
        }

        const response = await fetch(`http://localhost:8080/retrieveTraffic/${ipfsHash}`);
        if (!response.ok) throw new Error(`Error retrieving content from IPFS: ${response.statusText}`);

        const content = await response.json();
        setStoredTrafficData(content);
        setMessage("Traffic Data fetched successfully!");
    } catch (error) {
        console.error("Error fetching Traffic Data:", error);
        setMessage(`Error fetching Traffic Data: ${error.message}`);
    }
  };

  // Function to fetch Accident Data
  const fetchAccidentData = async () => {
    if (!dataStorage) return;

    try {
        const ipfsHash = await dataStorage.getAccidentDataIPFS();
        if (!ipfsHash || ipfsHash === "0x" || ipfsHash === "") {
            setMessage("No Accident Data found.");
            return;
        }

        const response = await fetch(`http://localhost:8080/retrieveAccident/${ipfsHash}`);
        if (!response.ok) throw new Error(`Error retrieving content from IPFS: ${response.statusText}`);

        const content = await response.json();
        setStoredAccidentData(content);
        setMessage("Accident Data fetched successfully!");
    } catch (error) {
        console.error("Error fetching Accident Data:", error);
        setMessage(`Error fetching Accident Data: ${error.message}`);
    }
  };

  // Add this function in App.js
  const consortiumAlgorithm = async (responseData) => {
    console.log("Lane Data:", responseData); // Log the laneData
    const vehicles = responseData?.vehicles || [];  // Assuming laneData contains vehicle info
    const TW = 5; // Time window for data collection in seconds
    const proposer = selectProposer(vehicles); // Select a proposer node
    const collectedData = collectData(vehicles, TW); // Collect data from vehicles

    console.log("Collected Data:", collectedData); // Log collected data  

    if (!collectedData.length) {
      setMessage("No data collected within the time window.");
      return;
    }

    const dataPackage = createDataPackage(responseData);
    const isValid = await verifyData(dataPackage);

    if (!verifyData(dataPackage)) {
      console.log("Data verification failed.");
      return null;
    }

    // Proceed with consensus mechanism (without timestamp validation)
    console.log("Data verified successfully. Proceeding with consensus...");

    if (!isValid) {
      console.log("Data verification failed.");
      setMessage("Data verification failed. Check the integrity of the data.");
      return;
    }

    console.log("Data verified successfully. Proceeding with consensus...");

    // Proceed with consensus mechanism
    await broadcastPrepareMessage(dataPackage, proposer);
    const consensusReached = await checkConsensus(dataPackage, vehicles);

    if (consensusReached) {
        const confidenceScore = calculateConfidenceScore(collectedData);
        console.log("Data stored with confidence score:", confidenceScore);
        setMessage("Consensus reached and data stored successfully!");
        setMessage(`Consensus reached and data stored successfully! \n
          Data stored with confidence score: ${confidenceScore}`);
        // Add the alert message here
        const proposerId = proposer.id;
        const otherVehicles = vehicles.filter(vehicle => vehicle.id !== proposerId);
        const message = `${proposerId} sent message to other vehicles in lane ${laneName}.`;
        alert(message);

    } else {
        setMessage("Consensus not reached. Try again later.");
    }
  };

  // Helper functions
  const selectProposer = (vehicles) => {
    if (!vehicles || vehicles.length === 0) {
        throw new Error("No vehicles available for proposer selection.");
    }
    const randomIndex = Math.floor(Math.random() * vehicles.length);
    return vehicles[randomIndex]; // Select a random vehicle as proposer
  };

  const collectData = (vehicles) => {
    return vehicles; // Return all vehicles without filtering by timestamp
  };

  const createDataPackage = (responseData) => {
    const dataPackage = {
        data: {
            accidents: responseData.accidents.map(accident => ({
                vehicle_id: accident.vehicle_id,
                other_vehicle_id: accident.other_vehicle_id,
                position: accident.position,
                timestamp: accident.timestamp,
            })),
            suddenStops: responseData.suddenStops.map(stop => ({
                vehicle_id: stop.vehicle_id,
                position: stop.position,
                timestamp: stop.timestamp,
            })),
        },
    };

    // Calculate and add the expected hash
    dataPackage.expectedHash = calculateHash(dataPackage.data);

    return dataPackage;
  };

  // Helper function to verify data integrity
  const verifyData = async (dataPackage) => {
    const { data, expectedHash } = dataPackage;

    // Ensure the basic structure of data exists
    if (!data || !data.accidents || !data.suddenStops) {
      console.error("Data missing required fields.");
      return false;
    }

    // Calculate the hash of the current data
    const currentHash = calculateHash(data);

    // Compare the hashes
    if (currentHash !== expectedHash) {
        console.error("Data integrity check failed");
        return false;
    }

    return true; // Data is valid
  };

  const calculateHash = (data) => {
    return CryptoJS.SHA256(JSON.stringify(data)).toString(CryptoJS.enc.Hex);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown Time";
    
    const date = new Date(timestamp * 1000); // Convert UNIX timestamp (seconds)
    return date.toISOString().substr(11, 8); // Extract HH:mm:ss
  };

  // Function to send notifications
  const sendNotification = (message) => {
      toast.info(message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
      });
  };

  const broadcastPrepareMessage = async (dataPackage, proposer) => {
    const { accidents, suddenStops } = dataPackage.data;

    if (accidents && accidents.length > 0) {
        accidents.forEach(accident => {
            const notification = `Accident detected -- Vehicle ${accident.vehicle_id} and Vehicle ${accident.other_vehicle_id} got an accident in position ${accident.position.join(", ")} at timestamp ${formatTimestamp(accident.timestamp)}`;
            sendNotificationToVehicles(notification, proposer.id, accident.other_vehicle_id);
        });
    }

    if (suddenStops && suddenStops.length > 0) {
        suddenStops.forEach(stop => {
            const notification = `Sudden stop detected -- Vehicle ${stop.vehicle_id} is suddenly stopped in position ${stop.position.join(", ")}, lane ${lane} at timestamp ${formatTimestamp(stop.timestamp)}`;
            sendNotificationToVehicles(notification, proposer.id, stop.vehicle_id);
        });
    }
  };

  // Helper function to send notifications to vehicles
  const sendNotificationToVehicles = (message, senderId, receiverId) => {
      console.log(`Notification from ${senderId} to ${receiverId}: ${message}`);
      // Here, you can implement the logic to send the notification to the specified vehicle
      sendNotification(message); // This will display the notification on the app
  };


  const checkConsensus = async (dataPackage, vehicles) => {
    // Check if at least 2/3 of nodes agree on the data package
    return true; // Mock implementation; implement actual consensus logic
  };

  const calculateConfidenceScore = (collectedData) => {
    // Calculate confidence score based on the number of vehicles
    const N_u = collectedData.length; // Number of vehicles uploading data
    const N_v = Math.max(1, collectedData.length); // Total vehicles (ensure >= 1)

    if (N_u === 1) {
        return 0.9; // Example score for single vehicle
    } else {
        const score = (N_u / N_v).toFixed(2);  // Normalize score
    
    if (score > 0.8) return `High Confidence (${score})`;
    if (score > 0.5) return `Medium Confidence (${score})`;
    return `Low Confidence (${score})`;
    }
  };

  const laneMapping = {
    "Lane 1": "gneE1_0",
    "Lane 2": "gneE2_0",
    "Lane 3": "gneE3_0",
    "Lane 4": "gneE4_0",
    "Lane 5": "gneE5_0",
    "-Lane 1": "-gneE1_0",
    "-Lane 2": "-gneE2_0",
    "-Lane 3": "-gneE3_0",
    "-Lane 4": "-gneE4_0",
    "-Lane 5": "-gneE5_0",
  };

  const handleLaneSearch = async () => {
    if (laneName.trim() === "") {
      setMessage("Please enter a valid lane.");
      return;
    }
    const lane = laneMapping[laneName];
    if (!lane) {
      setMessage("Invalid lane number.");
      return;
    }
    setMessage(`Searching for lane ${laneName} : ${lane.trim()}...`);
    // Start measuring time for searching
    const searchStartTime = performance.now();
    try {
      const response = await axios.get(`http://localhost:8080/search/${lane.trim()}`);
      console.log("Response Data:", response.data); // Log the entire response data
      setResponseData(response.data);

      // End measuring time for searching
      const searchEndTime = performance.now();
      const searchDuration = searchEndTime - searchStartTime; // Duration in milliseconds
      console.log(`Time taken for searching: ${searchDuration.toFixed(2)} ms`);

      await storeDataOnBlockchain(response.data); // Store data on blockchain after receiving response

      // Call consortium algorithm and measure time for selection
      const selectionStartTime = performance.now();
      await consortiumAlgorithm(response.data); // Call consortium algorithm

      const selectionEndTime = performance.now();
      const selectionDuration = selectionEndTime - selectionStartTime; // Duration in milliseconds
      console.log(`Time taken for selection: ${selectionDuration.toFixed(2)} ms`);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage("Error fetching data.");
    }
  };

  // Function to store search result data on blockchain via IPFS
  const storeDataOnBlockchain = async (data) => {
    if (!dataStorage) return;

    try {
      // Send the data to the backend to store it in IPFS
      const apiResponse = await fetch("http://localhost:8080/storeData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!apiResponse.ok) {
        throw new Error(`Error from IPFS API: ${apiResponse.statusText}`);
      }

      const { cid } = await apiResponse.json();
      console.log("Received CID from IPFS:", cid);

      // Store the CID on the blockchain
      const tx = await dataStorage.storeTrafficData(cid);
      await tx.wait();

      console.log("Data stored in smart contract:", cid);
      setMessage("Data stored successfully!");
      setIsDataStored(true);

      // Set the stored IPFS hash in the state
      setIpfsHash(cid);  // Store CID for display

    } catch (error) {
      console.error("Error storing data on blockchain:", error);
      setMessage(`Error storing data: ${error.message}`);
    }
  };

  // Functions to handle showing and closing the traffic popup
  const handleShowTrafficPopup = () => setShowTrafficPopup(true);
  const handleCloseTrafficPopup = () => setShowTrafficPopup(false);

  // Functions to handle showing and closing the accident popup
  const handleShowAccidentPopup = () => setShowAccidentPopup(true);
  const handleCloseAccidentPopup = () => setShowAccidentPopup(false);

  const handleLoadMoreT = () => {
    setShowTrafficPopup(true); // Show the traffic popup
  };

  const handleLoadMoreA = () => {
    setShowAccidentPopup(true); // Show the accident popup
  };
  
  return (
    <div className="App">
      <header>
        <h1>Road Hazard Detection & Information Exchange</h1>
        {message && <p className="message" style={{ whiteSpace: 'pre-wrap' }}>{message}</p>}
      </header>

      <main>
        <section>
          <div className="button-container">
            <button onClick={storeTrafficData}>Store Traffic Data</button>
            <button onClick={storeAccidentData}>Store Accident Data</button>
            <button onClick={fetchTrafficData}>Fetch Traffic Data</button>
            <button onClick={fetchAccidentData}>Fetch Accident Data</button>
          </div>
        </section>

        <section className="data-section">
          <div className="input-group">
            <label htmlFor="laneInput" className="label">
              Enter Lane:
            </label>
            <input
              id="laneInput"
              type="text"
              value={laneName}
              onChange={(e) => setLaneName(e.target.value)}
              placeholder="e.g., Lane 1"
              className="input"
            />
            <button onClick={handleLaneSearch} className="button">
              Search Lane
            </button>
          </div>
          
        </section>

        <section className="input-section">
              <section className="data-section">

                  {isDataStored && trafficIpfsHash && (
                  <section className="ipfs">
                      <h2>IPFS Hash (CID) for Stored Traffic Data in Blockchain:</h2>
                      <p>{trafficIpfsHash}</p> {/* Display the IPFS hash */}
                  </section>
                  )}
            
                  {/* Traffic Data Display */}
                  <div className="data-group">
                      {/* <h2>Traffic Data</h2> */}
                      {trafficData.slice(0, (currentPage + 1) * itemsPerPage).map((data, index) => (
                          <div key={index} className="data-card">
                              <h2><i>Traffic Data</i></h2>
                              <pre>{JSON.stringify(data, null, 2)}</pre>
                              <button 
                                onClick={handleLoadMoreT}
                                className="load-more"
                              >
                                Load More Traffic Data
                              </button>
                          </div>
                      ))}
                  </div>

                  {isDataStored && accidentIpfsHash && (
                    <section className="ipfs">
                      <h2>IPFS Hash (CID) for Stored Accident Data in Blockchain:</h2>
                      <p>{accidentIpfsHash}</p> {/* Display the IPFS hash */}
                    </section>
                  )}

                  {/* Accident Data Display */}
                  <div className="data-group">
                      {/* <h2>Accident Data</h2> */}
                      {accidentData.slice(0, (currentPage + 1) * itemsPerPage).map((data, index) => (
                          <div key={index} className="data-card">
                              <h2><i>Accident Data</i></h2>
                              <pre>{JSON.stringify(data, null, 2)}</pre>
                              <button
                                onClick={handleLoadMoreA}
                                className="load-more"
                                >
                                  Load More Accident Data
                              </button>
                          </div>
                      ))}
                  </div>
              </section>

              {/* Popups for Full Data Display */}
              {showTrafficPopup && (
                  <div className="popup-card show">
                      <h2><i>Remaining Traffic Data</i></h2>
                      {trafficData.map((data, index) => (
                          <div key={index} className="data-card">
                              <pre>{JSON.stringify(data, null, 2)}</pre>
                          </div>
                      ))}
                      <button onClick={handleCloseTrafficPopup}>Close</button>
                      <div className="popup-overlay" onClick={handleCloseTrafficPopup}></div>
                  </div>
              )}

              {/* Show full accident data popup */}
              {showAccidentPopup && (
                <div className="popup-card show">
                  <h2><i>Remaining Accident Data</i></h2>
                    {accidentData.map((data, index) => (
                      <div key={index} className="data-card">
                        <pre>{JSON.stringify(data, null, 2)}</pre>
                      </div>
                    ))}
                    <button onClick={handleCloseAccidentPopup}>Close</button>
                    <div className="popup-overlay" onClick={handleCloseAccidentPopup}></div>
                </div>
              )}
        </section>

        {isDataStored && ipfsHash && (
        <section className="ipfs">
            <h2>IPFS Hash (CID) for Stored Data in Blockchain:</h2>
            <p>{ipfsHash}</p> {/* Display the IPFS hash */}
        </section>
        )}

        {responseData && (
          <section className="searched-data">
            <div className="data-container">
              <div>
                <h3>Sudden Stop Data for Lane {lane}:</h3>
                {responseData.suddenStops && responseData.suddenStops.length > 0 ? (
                  <ul className="data-list">
                    {responseData.suddenStops.map((stop, index) => (
                      <li key={index} className="data-item">
                        <i> <strong>Vehicle ID:</strong> {stop.vehicle_id} </i> <br /> 
                        <i> <strong>Timestamp:</strong> {stop.timestamp} </i> <br /> 
                        <i> <strong>Position:</strong> {stop.position.join(", ")} </i> <br /> 
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="message">No sudden stops found in this lane.</p>
                )}
              </div>

              <div>
                <h3>Accident Data for Lane {lane}:</h3>
                {responseData.accidents && responseData.accidents.length > 0 ? (
                  <ul className="data-list">
                    {responseData.accidents.map((accident, index) => (
                      <li key={index} className="data-item">
                        <strong>Vehicle ID:</strong> {accident.vehicle_id} <br />
                        <strong>Timestamp:</strong> {accident.timestamp} <br />
                        <strong>Position:</strong> {accident.position.join(", ")} <br />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="message">No accidents found in this lane.</p>
                )}
              </div>
            </div>
          </section>
        )}

      <ToastContainer position="top-right" autoClose={5000} />
      </main>
    </div>

  );
}

export default App;