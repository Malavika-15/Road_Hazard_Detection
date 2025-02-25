import React from 'react';
import { useNavigate } from 'react-router-dom';
import "./Home.css";
import sumo from './assests/vid/SUMO.mp4'; // Ensure this path is correct
import metamask from './assests/vid/Metamask.mp4'; // Ensure this path is correct
import blockchain from './assests/vid/Blockchain.mp4'; // Ensure this path is correct
import smartcontract from './assests/vid/SmartContract.mp4'
import ipfs from './assests/vid/IPFS.mp4';
import info from './assests/vid/V2V Communication.mp4';

const Home = () => {
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate('/App');
    };

    return (
        <div className="home">
            <div className="header">
                <h1 className="title">Road Hazard Detection & Information Exchange</h1>
            </div>

            <div className="about">
                <p>This project develops a secure system for detecting and sharing dangerous road conditions using blockchain technology. It ensures data integrity, authenticity, and real-time performance in vehicle networks.</p>
                <p>Using SUMO simulator for real-time performance and testing, the system generates reliable data for efficient blockchain integration.</p>
                <p>MetaMask blockchain wallet is used for secure transactions and data storage, ensuring a decentralized and trustless system.</p>
            </div>

            <div className="video-container">
                <div className="video-section">
                    <h2>SUMO Simulator</h2>
                    <video className="video" controls>
                        <source src={sumo} type="video/mp4" />
                    </video>
                </div>
                <div className="video-section">
                    <h2>Blockchain Technology</h2>
                    <video className="video" controls>
                        <source src={blockchain} type="video/mp4" style={{ '--f': '.12', '--r': '5px' }}/>
                    </video>
                </div>
                <div className="video-section">
                    <h2>MetaMask</h2>
                    <video className="video" controls>
                        <source src={metamask} type="video/mp4" style={{ '--f': '.08', '--r': '20px' }}/>
                    </video>
                </div>
                <div className="video-section">
                    <h2>IPFS Inter-Planetary File System</h2>
                    <video className="video" controls>
                        <source src={ipfs} type="video/mp4" />
                    </video>
                </div>
                <div className="video-section">
                    <h2>SmartContract</h2>
                    <video className="video" controls>
                        <source src={smartcontract} type="video/mp4" style={{ '--f': '.12', '--r': '5px' }}/>
                    </video>
                </div>
                <div className="video-section">
                    <h2>Info Exchange</h2>
                    <video className="video" controls>
                        <source src={info} type="video/mp4" style={{ '--f': '.08', '--r': '20px' }}/>
                    </video>
                </div>
            </div>

            <button onClick={handleNavigate}>Explore More</button>
        </div>
    );
};

export default Home;