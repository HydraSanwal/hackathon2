---
title: Digital Twin Exercises
sidebar_position: 6
description: Practice exercises with solutions for Digital Twin concepts
tags: [digital-twin, exercises, practice, simulation, problems]
---

# Digital Twin Exercises

<div class="exercise-block">
### Getting Started
Don't worry if Digital Twin concepts seem complex at first! These exercises are designed to help you apply what you've learned about simulation and virtual-physical system connections. Take it one step at a time and refer to the examples in the previous section as needed.
</div>

## Exercise 1: Simple Digital Twin Bridge

### Problem Statement
Create a ROS 2 node that acts as a bridge between a physical robot and its Gazebo simulation. The bridge should:
1. Subscribe to sensor data from the physical robot
2. Update the simulation to reflect the physical robot's state
3. Subscribe to commands from the simulation
4. Forward those commands to the physical robot

### Prerequisites
- Understanding of ROS 2 topics and message types
- Knowledge of Gazebo simulation
- Basic Python or C++ programming skills

### Exercise
1. Create a bridge node with:
   - Subscribers for physical robot sensor data (joint states, IMU, etc.)
   - Publishers for simulation robot commands (velocity, joint positions)
   - Subscribers for simulation robot sensor data
   - Publishers for physical robot commands

2. Implement state synchronization between physical and virtual robots:
   - Map physical robot state to simulation
   - Apply simulation commands to physical robot
   - Handle time synchronization between systems

3. Add error handling for connection failures and data inconsistencies.

### Hints
- Use `tf2` for coordinate transformations between robots
- Consider time delays in communication between systems
- Implement validation checks for sensor data
- Use appropriate Quality of Service (QoS) settings for real-time requirements

### Solution

```
# Python implementation of Digital Twin Bridge
# File: digital_twin_bridge.py

#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState, Imu
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry
from std_msgs.msg import Float64MultiArray
import numpy as np
import time

class DigitalTwinBridge(Node):
    def __init__(self):
        super().__init__('digital_twin_bridge')

        # Physical robot topics
        self.physical_joint_sub = self.create_subscription(
            JointState, '/physical_robot/joint_states', self.physical_joint_callback, 10)
        self.physical_imu_sub = self.create_subscription(
            Imu, '/physical_robot/imu', self.physical_imu_callback, 10)
        self.physical_odom_sub = self.create_subscription(
            Odometry, '/physical_robot/odom', self.physical_odom_callback, 10)

        # Simulation robot topics
        self.sim_cmd_pub = self.create_publisher(
            Twist, '/simulation_robot/cmd_vel', 10)
        self.sim_joint_pub = self.create_publisher(
            Float64MultiArray, '/simulation_robot/joint_commands', 10)

        # Command forwarding
        self.sim_cmd_sub = self.create_subscription(
            Twist, '/simulation_robot/cmd_vel_ref', self.sim_cmd_callback, 10)
        self.physical_cmd_pub = self.create_publisher(
            Twist, '/physical_robot/cmd_vel', 10)

        # State synchronization timer
        self.sync_timer = self.create_timer(0.1, self.synchronize_states)  # 10 Hz

        # Robot state storage
        self.physical_state = {
            'joint_positions': [],
            'joint_names': [],
            'imu_data': None,
            'odom_data': None,
            'last_update': 0.0
        }

        self.simulation_state = {
            'joint_positions': [],
            'cmd_vel': None,
            'last_update': 0.0
        }

        self.get_logger().info('Digital Twin Bridge initialized')

    def physical_joint_callback(self, msg):
        """Receive joint states from physical robot"""
        self.physical_state['joint_positions'] = list(msg.position)
        self.physical_state['joint_names'] = list(msg.name)
        self.physical_state['last_update'] = time.time()
        self.get_logger().debug(f'Physical joint state updated: {len(msg.position)} joints')

    def physical_imu_callback(self, msg):
        """Receive IMU data from physical robot"""
        self.physical_state['imu_data'] = {
            'orientation': [msg.orientation.x, msg.orientation.y, msg.orientation.z, msg.orientation.w],
            'angular_velocity': [msg.angular_velocity.x, msg.angular_velocity.y, msg.angular_velocity.z],
            'linear_acceleration': [msg.linear_acceleration.x, msg.linear_acceleration.y, msg.linear_acceleration.z]
        }

    def physical_odom_callback(self, msg):
        """Receive odometry from physical robot"""
        self.physical_state['odom_data'] = {
            'position': [msg.pose.pose.position.x, msg.pose.pose.position.y, msg.pose.pose.position.z],
            'orientation': [msg.pose.pose.orientation.x, msg.pose.pose.orientation.y, msg.pose.pose.orientation.z, msg.pose.pose.orientation.w],
            'linear_vel': [msg.twist.twist.linear.x, msg.twist.twist.linear.y, msg.twist.twist.linear.z],
            'angular_vel': [msg.twist.twist.angular.x, msg.twist.twist.angular.y, msg.twist.twist.angular.z]
        }

    def sim_cmd_callback(self, msg):
        """Receive commands from simulation"""
        self.simulation_state['cmd_vel'] = {
            'linear': [msg.linear.x, msg.linear.y, msg.linear.z],
            'angular': [msg.angular.x, msg.angular.y, msg.angular.z]
        }
        # Forward to physical robot
        self.physical_cmd_pub.publish(msg)
        self.get_logger().info(f'Forwarded command to physical robot: linear=({msg.linear.x:.2f}, {msg.linear.y:.2f}), angular={msg.angular.z:.2f}')

    def synchronize_states(self):
        """Synchronize states between physical and virtual robots"""
        current_time = time.time()

        # Update simulation robot to match physical robot state
        if self.physical_state['joint_positions']:
            # Create joint command to match physical state
            joint_cmd = Float64MultiArray()
            joint_cmd.data = self.physical_state['joint_positions']
            self.sim_joint_pub.publish(joint_cmd)
            self.get_logger().debug('Updated simulation joint positions')

        # Update simulation robot odometry to match physical robot
        if self.physical_state['odom_data']:
            # Create twist command to match physical robot's motion
            cmd_vel = Twist()
            cmd_vel.linear.x = self.physical_state['odom_data']['linear_vel'][0]
            cmd_vel.linear.y = self.physical_state['odom_data']['linear_vel'][1]
            cmd_vel.angular.z = self.physical_state['odom_data']['angular_vel'][2]

            self.sim_cmd_pub.publish(cmd_vel)
            self.get_logger().debug('Updated simulation robot motion')

    def validate_data(self, data):
        """Validate sensor data for reasonable values"""
        if data is None:
            return False

        # Check for NaN or infinite values
        if isinstance(data, list):
            for val in data:
                if np.isnan(val) or np.isinf(val):
                    return False
        else:
            if np.isnan(data) or np.isinf(data):
                return False

        return True

def main(args=None):
    rclpy.init(args=args)
    bridge = DigitalTwinBridge()

    try:
        rclpy.spin(bridge)
    except KeyboardInterrupt:
        bridge.get_logger().info('Shutting down Digital Twin Bridge...')
    finally:
        bridge.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Validation Criteria
- Bridge successfully forwards commands from simulation to physical robot
- Simulation robot reflects physical robot's state changes
- Error handling prevents crashes from invalid data
- Synchronization occurs at appropriate frequency
- No data loss during normal operation

---

## Exercise 2: Unity-Gazebo Hybrid Simulation

### Problem Statement
Design a hybrid simulation system that combines Unity's high-quality graphics with Gazebo's accurate physics. The system should:
1. Run physics simulation in Gazebo
2. Render graphics in Unity
3. Synchronize state between both systems
4. Provide a unified interface for robot control

### Prerequisites
- Understanding of both Gazebo and Unity simulation platforms
- Knowledge of ROS/ROS 2 integration
- Experience with state synchronization concepts

### Exercise
1. Design the architecture for the hybrid system:
   - Define data exchange protocols between Gazebo and Unity
   - Specify the types of data to be synchronized
   - Plan the timing and frequency of synchronization

2. Create a synchronization node that:
   - Receives physics state from Gazebo
   - Sends graphics commands to Unity
   - Receives user input from Unity
   - Sends control commands to Gazebo

3. Implement the system and test with a simple robot model.

### Hints
- Use ROS/ROS 2 as the communication backbone
- Consider time synchronization between systems
- Implement interpolation for smooth visualization
- Handle different update rates between physics and graphics

### Solution

```
# Hybrid Simulation Synchronizer
# File: hybrid_sim_sync.py

#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from gazebo_msgs.msg import ModelStates
from geometry_msgs.msg import Pose, Twist
from sensor_msgs.msg import JointState
from std_msgs.msg import Float64
import time
import math

class HybridSimulationSynchronizer(Node):
    def __init__(self):
        super().__init__('hybrid_sim_synchronizer')

        # Gazebo topics (physics engine)
        self.gazebo_model_sub = self.create_subscription(
            ModelStates, '/gazebo/model_states', self.gazebo_model_callback, 10)

        # Unity topics (visualization)
        self.unity_pose_pub = self.create_publisher(
            Pose, '/unity/robot_pose', 10)
        self.unity_joint_pub = self.create_publisher(
            JointState, '/unity/joint_states', 10)

        # Control topics
        self.cmd_sub = self.create_subscription(
            Twist, '/robot/cmd_vel', self.cmd_callback, 10)
        self.gazebo_cmd_pub = self.create_publisher(
            Twist, '/gazebo/cmd_vel', 10)

        # Synchronization timer
        self.sync_timer = self.create_timer(0.033, self.sync_callback)  # ~30 Hz for smooth graphics

        # State storage
        self.gazebo_states = {}
        self.unity_states = {}
        self.last_sync_time = time.time()

        self.get_logger().info('Hybrid Simulation Synchronizer initialized')

    def gazebo_model_callback(self, msg):
        """Receive model states from Gazebo physics simulation"""
        for i, name in enumerate(msg.name):
            if 'robot' in name.lower():  # Filter for robot models
                self.gazebo_states[name] = {
                    'pose': msg.pose[i],
                    'twist': msg.twist[i]
                }

    def cmd_callback(self, msg):
        """Receive control commands and forward to Gazebo"""
        # Forward command to Gazebo for physics simulation
        self.gazebo_cmd_pub.publish(msg)

        # Store for Unity visualization
        self.unity_states['cmd_vel'] = msg

    def sync_callback(self):
        """Synchronize states between Gazebo and Unity"""
        current_time = time.time()

        # Update Unity with Gazebo physics results
        for model_name, state in self.gazebo_states.items():
            if 'robot' in model_name:
                # Publish robot pose to Unity for visualization
                self.unity_pose_pub.publish(state['pose'])

                # Create joint states for Unity (if needed)
                joint_msg = JointState()
                joint_msg.header.stamp = self.get_clock().now().to_msg()
                joint_msg.name = ['wheel_joint_fl', 'wheel_joint_fr', 'wheel_joint_bl', 'wheel_joint_br']

                # Calculate wheel positions based on robot motion (simplified)
                # In a real system, this would come from Gazebo joint states
                wheel_pos = self.calculate_wheel_positions(state['twist'])
                joint_msg.position = wheel_pos
                joint_msg.velocity = [0.0, 0.0, 0.0, 0.0]  # Simplified
                joint_msg.effort = [0.0, 0.0, 0.0, 0.0]   # Simplified

                self.unity_joint_pub.publish(joint_msg)

        self.last_sync_time = current_time

    def calculate_wheel_positions(self, twist):
        """Calculate wheel positions based on robot twist (simplified)"""
        # This is a simplified calculation
        # In a real system, you would get actual joint positions from Gazebo
        linear_vel = math.sqrt(twist.linear.x**2 + twist.linear.y**2)
        angular_vel = twist.angular.z

        # Simple wheel rotation based on linear and angular velocity
        wheel_rotation = linear_vel * 0.1 + abs(angular_vel) * 0.05

        return [wheel_rotation, wheel_rotation, wheel_rotation, wheel_rotation]

def main(args=None):
    rclpy.init(args=args)
    synchronizer = HybridSimulationSynchronizer()

    try:
        rclpy.spin(synchronizer)
    except KeyboardInterrupt:
        synchronizer.get_logger().info('Shutting down Hybrid Simulation Synchronizer...')
    finally:
        synchronizer.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Validation Criteria
- Physics simulation runs in Gazebo with accurate results
- Graphics rendering occurs in Unity with smooth visualization
- State synchronization maintains consistency between systems
- Control commands affect both physics and visualization
- System operates with acceptable performance

---

## Exercise 3: Digital Twin for Predictive Maintenance

### Problem Statement
Create a Digital Twin system that monitors a robot's health and predicts maintenance needs. The system should:
1. Collect sensor data from the physical robot
2. Analyze the data for patterns indicating wear or malfunction
3. Predict when maintenance is needed
4. Update the simulation with predicted future states

### Prerequisites
- Understanding of sensor data processing
- Basic knowledge of predictive analytics
- Experience with Digital Twin concepts

### Exercise
1. Design the predictive maintenance architecture:
   - Identify key sensors for monitoring robot health
   - Define metrics for wear and performance degradation
   - Plan the prediction algorithm

2. Implement the monitoring system:
   - Collect and store sensor data
   - Calculate health metrics
   - Predict maintenance needs
   - Update Digital Twin with predictions

3. Test the system with simulated degradation patterns.

### Hints
- Focus on motor current, temperature, and vibration sensors
- Use statistical methods for anomaly detection
- Consider using machine learning for prediction
- Implement visualization of health status

### Solution

```
# Predictive Maintenance Digital Twin
# File: predictive_maintenance.py

#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState, Temperature, Imu
from std_msgs.msg import Float64, String
import numpy as np
from collections import deque
import time

class PredictiveMaintenanceTwin(Node):
    def __init__(self):
        super().__init__('predictive_maintenance_twin')

        # Subscriptions for robot health data
        self.joint_state_sub = self.create_subscription(
            JointState, '/robot/joint_states', self.joint_state_callback, 10)
        self.temperature_sub = self.create_subscription(
            Temperature, '/robot/motor_temps', self.temperature_callback, 10)
        self.current_sub = self.create_subscription(
            Float64, '/robot/motor_current', self.current_callback, 10)

        # Publishers for health status
        self.health_status_pub = self.create_publisher(
            String, '/robot/health_status', 10)
        self.maintenance_prediction_pub = self.create_publisher(
            String, '/robot/maintenance_prediction', 10)

        # Timer for health analysis
        self.health_timer = self.create_timer(1.0, self.analyze_health)  # 1 Hz

        # Health monitoring data
        self.joint_data = {}
        self.temperature_history = deque(maxlen=100)  # Keep last 100 readings
        self.current_history = deque(maxlen=100)
        self.health_metrics = {
            'motor_temp_avg': 0.0,
            'motor_temp_max': 0.0,
            'current_avg': 0.0,
            'current_max': 0.0,
            'vibration_avg': 0.0,
            'wear_estimate': 0.0  # 0.0 to 1.0 scale
        }

        self.get_logger().info('Predictive Maintenance Digital Twin initialized')

    def joint_state_callback(self, msg):
        """Process joint state data for health monitoring"""
        for i, name in enumerate(msg.name):
            if name not in self.joint_data:
                self.joint_data[name] = {
                    'positions': deque(maxlen=50),
                    'velocities': deque(maxlen=50),
                    'efforts': deque(maxlen=50)
                }

            # Store joint data
            self.joint_data[name]['positions'].append(msg.position[i] if i < len(msg.position) else 0.0)
            self.joint_data[name]['velocities'].append(msg.velocity[i] if i < len(msg.velocity) else 0.0)
            self.joint_data[name]['efforts'].append(msg.effort[i] if i < len(msg.effort) else 0.0)

    def temperature_callback(self, msg):
        """Process temperature data"""
        self.temperature_history.append(msg.temperature)

        # Update health metrics
        if len(self.temperature_history) > 0:
            self.health_metrics['motor_temp_avg'] = np.mean(self.temperature_history)
            self.health_metrics['motor_temp_max'] = max(self.temperature_history)

    def current_callback(self, msg):
        """Process motor current data"""
        self.current_history.append(msg.data)

        # Update health metrics
        if len(self.current_history) > 0:
            self.health_metrics['current_avg'] = np.mean(self.current_history)
            self.health_metrics['current_max'] = max(self.current_history)

    def analyze_health(self):
        """Analyze robot health and predict maintenance needs"""
        # Calculate wear estimate based on various factors
        wear_factors = []

        # Temperature-based wear (higher temperature = more wear)
        temp_wear = min(1.0, self.health_metrics['motor_temp_avg'] / 80.0)  # Assume 80°C is critical
        wear_factors.append(temp_wear)

        # Current-based wear (higher current = more wear/stress)
        current_wear = min(1.0, self.health_metrics['current_avg'] / 10.0)  # Assume 10A is critical
        wear_factors.append(current_wear)

        # Vibration-based wear (calculated from joint effort variance)
        effort_variance = self.calculate_effort_variance()
        vibration_wear = min(1.0, effort_variance / 100.0)  # Adjust threshold as needed
        wear_factors.append(vibration_wear)

        # Calculate overall wear estimate
        self.health_metrics['wear_estimate'] = np.mean(wear_factors) if wear_factors else 0.0

        # Determine health status
        health_status = self.determine_health_status()

        # Predict maintenance timeline
        maintenance_prediction = self.predict_maintenance_timeline()

        # Publish results
        health_msg = String()
        health_msg.data = f"Health: {health_status}, Wear: {self.health_metrics['wear_estimate']:.2f}"
        self.health_status_pub.publish(health_msg)

        maintenance_msg = String()
        maintenance_msg.data = maintenance_prediction
        self.maintenance_prediction_pub.publish(maintenance_msg)

        self.get_logger().info(f'Health Analysis: {health_status}, Maintenance: {maintenance_prediction}')

    def calculate_effort_variance(self):
        """Calculate variance in joint efforts as a measure of vibration/stress"""
        all_efforts = []
        for joint_data in self.joint_data.values():
            all_efforts.extend(list(joint_data['efforts']))

        if len(all_efforts) > 1:
            return np.var(all_efforts)
        else:
            return 0.0

    def determine_health_status(self):
        """Determine overall health status based on metrics"""
        wear = self.health_metrics['wear_estimate']

        if wear > 0.8:
            return "CRITICAL - Immediate maintenance required"
        elif wear > 0.6:
            return "WARNING - Maintenance recommended soon"
        elif wear > 0.4:
            return "FAIR - Normal operation with monitoring"
        else:
            return "GOOD - No maintenance needed"

    def predict_maintenance_timeline(self):
        """Predict when maintenance will be needed based on current wear rate"""
        wear = self.health_metrics['wear_estimate']

        # Simple linear projection (in reality, this would be more complex)
        # Assume current wear rate continues
        if wear > 0.7:
            return "Maintenance needed within 1-3 days"
        elif wear > 0.5:
            return "Maintenance recommended within 1-2 weeks"
        elif wear > 0.3:
            return "Maintenance recommended within 1 month"
        else:
            return "No maintenance needed in near future"

def main(args=None):
    rclpy.init(args=args)
    maint_twin = PredictiveMaintenanceTwin()

    try:
        rclpy.spin(maint_twin)
    except KeyboardInterrupt:
        maint_twin.get_logger().info('Shutting down Predictive Maintenance Digital Twin...')
    finally:
        maint_twin.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Validation Criteria
- System correctly monitors robot health metrics
- Predictions are based on actual sensor data trends
- Health status is published with appropriate urgency levels
- Maintenance predictions are reasonable and actionable
- System handles data anomalies gracefully

These exercises provide hands-on practice with Digital Twin concepts, allowing you to implement and test different aspects of virtual-physical system integration and predictive analytics.

## Navigation

- [Previous: Digital Twin Examples](./digital_twin_examples)
- [Module 2 Home](./index)