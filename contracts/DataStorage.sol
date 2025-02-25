// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DataStorage {
    address public owner;
    
    // Event to log when data is stored
    event DataStored(address indexed sender, string ipfsCID, uint256 timestamp);
    event TrafficDataStored(string ipfsHash);
    event AccidentDataStored(string ipfsHash);

    // Struct to store vehicle data
    struct VehicleData {
        string vehicleId;
        uint256 speed;
        string position;
        string lane;
    }

    // Struct to store accident detection data
    struct AccidentDetection {
        string receiverVehicle; // Receiver vehicle ID
        string senderVehicle; // Sender vehicle ID
        string messageType; // Type of message (e.g., sudden_stop)
        uint256 timestamp; // Timestamp of the detection
    }

    // Struct to store traffic data
    struct TrafficData {
        string ipfsCID; // CID of the stored data on IPFS
        uint256 timestamp;
    }

    // Mapping to store traffic data by sender address
    mapping(address => TrafficData[]) public trafficDataByAddress;

    // IPFS storage for traffic and accident data
    string public trafficIpfsHash;
    string public accidentIpfsHash;

    // Constructor to set the contract owner
    constructor() {
        owner = msg.sender;
    }

    // Modifier to allow only the contract owner to perform certain actions
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    // Function to store traffic data (IPFS CID) in the contract
    function storeTrafficData(string memory _ipfsCID) public returns (bool) {
        TrafficData memory newTrafficData = TrafficData({
            ipfsCID: _ipfsCID,
            timestamp: block.timestamp
        });

        trafficDataByAddress[msg.sender].push(newTrafficData);

        // Emit the event
        emit DataStored(msg.sender, _ipfsCID, block.timestamp);
        
        return true;
    }

    // Function to retrieve traffic data for the sender address
    function getTrafficData() public view returns (TrafficData[] memory) {
        return trafficDataByAddress[msg.sender];
    }

    // Function to retrieve traffic data for a specific address
    function getTrafficDataByAddress(address _address) public view returns (TrafficData[] memory) {
        return trafficDataByAddress[_address];
    }

    // Function to store accident data in IPFS
    function storeAccidentData(string memory _ipfsHash) public {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        accidentIpfsHash = _ipfsHash;
        emit AccidentDataStored(_ipfsHash);
    }

    // Function to store traffic data in IPFS
    function storeTrafficDataIPFS(string memory _ipfsHash) public {
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");
        trafficIpfsHash = _ipfsHash;
        emit TrafficDataStored(_ipfsHash);
    }

    // Function to fetch stored traffic data from IPFS
    function getTrafficDataIPFS() public view returns (string memory) {
        return trafficIpfsHash;
    }

    // Function to fetch stored accident data from IPFS
    function getAccidentDataIPFS() public view returns (string memory) {
        return accidentIpfsHash;
    }

    // Function to update the owner of the contract
    function updateOwner(address newOwner) public onlyOwner {
        owner = newOwner;
    }
}
