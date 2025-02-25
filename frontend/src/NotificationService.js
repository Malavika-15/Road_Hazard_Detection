// NotificationService.js
import { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import DataStorage from "./artifacts/DataStorage.json";

const CONTRACT_ADDRESS = "0xc4E8E012e004c310f69a1E3533eDb0076aEd37e9";

const NotificationService = ({ lane, onNewHazard }) => {
    const [hazardData, setHazardData] = useState([]);
    const hazardRef = useRef(new Set()); // Track already received hazards to prevent duplicates

    useEffect(() => {
        let contract;

        const setupContractListener = async () => {
            if (!window.ethereum) {
                console.error("Ethereum provider not found. Please install MetaMask.");
                return;
            }

            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                contract = new ethers.Contract(CONTRACT_ADDRESS, DataStorage.abi, provider);

                const handleHazardDetected = (hazard) => {
                    console.log("Hazard detected:", hazard);
                    
                    // Check if hazard is already recorded to prevent duplicates
                    if (!hazardRef.current.has(hazard.id)) {
                        hazardRef.current.add(hazard.id); // Mark as received

                        if (hazard.lane === lane) {
                            setHazardData((prev) => [...prev, hazard]);
                            
                            // Notify the parent component if a new hazard is detected
                            if (onNewHazard) {
                                onNewHazard(hazard);
                            }
                        }
                    }
                };

                contract.on("HazardDetected", handleHazardDetected);

            } catch (error) {
                console.error("Error setting up contract listener:", error);
            }
        };

        setupContractListener();

        return () => {
            if (contract) {
                contract.removeAllListeners("HazardDetected");
            }
        };
    }, [lane, onNewHazard]);

    return null; // No UI rendering
};

export default NotificationService;
