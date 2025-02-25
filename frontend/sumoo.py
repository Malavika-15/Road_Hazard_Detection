import traci
import json
import os
import random

# Initialize SUMO
sumoBinary = "sumo-gui"  # or "sumo" for non-GUI mode.
sumoCmd = [sumoBinary, "-c", "D:/Road_HazardD/sumo code/SUMO_ACCIDENT/SUMO_ACCIDENT/Configuration.sumo.cfg"]
traci.start(sumoCmd)

# Data storage for traffic and events
traffic_data_list = []
event_data_list = []

def get_traffic_data():
    """Collects traffic data, including vehicle type."""
    data = {
        "timestamp": traci.simulation.getTime(),
        "vehicles": []
    }
    for vehID in traci.vehicle.getIDList():
        data["vehicles"].append({
            "id": vehID,
            "type": traci.vehicle.getTypeID(vehID),  # Get vehicle type
            "position": traci.vehicle.getPosition(vehID),
            "speed": traci.vehicle.getSpeed(vehID),
            "lane": traci.vehicle.getLaneID(vehID)
        })
    return data

def broadcast_message(sender_vehicle, message_type):
    """Broadcasts a message to nearby vehicles."""
    sender_position = traci.vehicle.getPosition(sender_vehicle)
    all_vehicles = traci.vehicle.getIDList()
    broadcast_range = 100
    
    for vehicle in all_vehicles:
        if vehicle != sender_vehicle:
            receiver_position = traci.vehicle.getPosition(vehicle)
            distance = traci.simulation.getDistance2D(sender_position[0], sender_position[1], 
                                                     receiver_position[0], receiver_position[1], False)
            if distance < broadcast_range:
                process_message(vehicle, sender_vehicle, message_type)

def process_message(receiver_vehicle, sender_vehicle, message_type):
    """Processes the received message based on its type."""
    if message_type == "accident":
        print(f"Vehicle {receiver_vehicle} received accident info from {sender_vehicle}. Slowing down.")
        traci.vehicle.slowDown(receiver_vehicle, 5, 3)
        log_event(receiver_vehicle, sender_vehicle, message_type)
    elif message_type == "sudden_stop":
        print(f"Vehicle {receiver_vehicle} received sudden stop info from {sender_vehicle}. Slowing down.")
        traci.vehicle.slowDown(receiver_vehicle, 3, 2)
        log_event(receiver_vehicle, sender_vehicle, message_type)

def log_event(receiver_vehicle, sender_vehicle, message_type):
    """Logs the event into the data list."""
    event_data = {
        "receiver_vehicle": receiver_vehicle,
        "sender_vehicle": sender_vehicle,
        "message_type": message_type,
        "timestamp": traci.simulation.getTime()
    }
    event_data_list.append(event_data)

# Simulate and collect data for a specified number of steps
for step in range(130):  # Simulate for 130 steps.
    traci.simulationStep()
    
    # Collect traffic data
    traffic_data = get_traffic_data()
    traffic_data_list.append(traffic_data)

    # Randomly generate events
    vehicle_ids = traci.vehicle.getIDList()
    for vehicle_id in vehicle_ids:
        if random.random() < 0.01:
            event_type = random.choice(["accident", "sudden_stop"])
            print(f"Vehicle {vehicle_id} experienced a {event_type}. Broadcasting...")
            broadcast_message(vehicle_id, event_type)

# Save traffic data to a JSON file
traffic_json_file_path = 'traffic_data.json'
with open(traffic_json_file_path, 'w') as traffic_json_file:
    json.dump(traffic_data_list, traffic_json_file, indent=4)

# Save event logs to a separate JSON file
event_json_file_path = 'event_logs.json'
with open(event_json_file_path, 'w') as event_json_file:
    json.dump(event_data_list, event_json_file, indent=4)

# Check if the data has been stored in JSON
if os.path.exists(traffic_json_file_path):
    print(f"The file '{traffic_json_file_path}' exists. Reading contents...")
    
    # Read the traffic JSON file
    with open(traffic_json_file_path, 'r') as traffic_json_file:
        try:
            traffic_data = json.load(traffic_json_file)
            print("Traffic data successfully loaded:")
            print(json.dumps(traffic_data, indent=4))  # Pretty-print the JSON data
        except json.JSONDecodeError:
            print("Error: The traffic file is not a valid JSON.")

if os.path.exists(event_json_file_path):
    print(f"The file '{event_json_file_path}' exists. Reading contents...")
    
    # Read the event JSON file
    with open(event_json_file_path, 'r') as event_json_file:
        try:
            event_data = json.load(event_json_file)
            print("Event data successfully loaded:")
            print(json.dumps(event_data, indent=4))  # Pretty-print the JSON data
        except json.JSONDecodeError:
            print("Error: The event file is not a valid JSON.")

# Close SUMO
traci.close()
