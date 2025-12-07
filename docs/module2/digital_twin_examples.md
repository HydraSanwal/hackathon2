---
title: Digital Twin Code Examples
sidebar_position: 5
description: Text-based code examples demonstrating Digital Twin concepts with Gazebo and Unity
tags: [digital-twin, examples, code, simulation, implementation]
---

# Digital Twin Code Examples

<div class="code-example">
This section provides text-based code examples that demonstrate the practical implementation of Digital Twin concepts using Gazebo and Unity simulation platforms. These examples illustrate how to create virtual representations of physical systems and connect them with real-time data.
</div>

### How to Use These Examples
These examples show how to implement Digital Twin concepts using simulation platforms. Focus on understanding the patterns for connecting virtual and physical systems, rather than memorizing every line of code.

## Gazebo Simulation Example

This example demonstrates how to create a simple robot simulation in Gazebo and interface it with ROS 2:

```
# Launch file for a differential drive robot simulation
# File: launch/diff_drive_simulation.launch.py

from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare

def generate_launch_description():
    # Declare launch arguments
    use_sim_time = LaunchConfiguration('use_sim_time', default='true')

    # Robot description (URDF)
    robot_description_content = PathJoinSubstitution([
        FindPackageShare("my_robot_description"),
        "urdf",
        "diff_drive_robot.urdf.xacro"
    ])

    # Robot state publisher
    robot_state_publisher = Node(
        package='robot_state_publisher',
        executable='robot_state_publisher',
        output='screen',
        parameters=[{
            'use_sim_time': use_sim_time,
            'robot_description': robot_description_content
        }]
    )

    # Gazebo simulation
    gazebo = Node(
        package='gazebo_ros',
        executable='spawn_entity.py',
        arguments=[
            '-entity', 'diff_drive_robot',
            '-topic', 'robot_description',
            '-x', '0', '-y', '0', '-z', '0.5'
        ],
        output='screen'
    )

    # Controller manager
    diff_drive_spawner = Node(
        package="controller_manager",
        executable="spawner",
        arguments=["diff_drive_controller"],
    )

    joint_broad_spawner = Node(
        package="controller_manager",
        executable="spawner",
        arguments=["joint_state_broadcaster"],
    )

    return LaunchDescription([
        DeclareLaunchArgument(
            'use_sim_time',
            default_value='true',
            description='Use simulation time'
        ),
        robot_state_publisher,
        gazebo,
        diff_drive_spawner,
        joint_broad_spawner
    ])
```

**Explanation:**
- Launch file sets up a differential drive robot in Gazebo simulation
- Robot description is loaded via URDF/Xacro
- Controllers are spawned to manage robot behavior
- Simulation uses simulated time instead of real time

## Gazebo Plugin Example

This example shows how to create a custom sensor plugin for Gazebo:

```
/*
 * Custom sensor plugin for Gazebo
 * File: custom_sensor_plugin.cc
 */

#include <gazebo/gazebo.hh>
#include <gazebo/sensors/sensors.hh>
#include <gazebo/physics/physics.hh>
#include <ros/ros.h>
#include <sensor_msgs/Range.h>

namespace gazebo
{
  class CustomSensorPlugin : public SensorPlugin
  {
    public: void Load(sensors::SensorPtr _sensor, sdf::ElementPtr _sdf)
    {
      // Get the parent sensor
      this->parentSensor =
        std::dynamic_pointer_cast<sensors::RaySensor>(_sensor);

      if (!this->parentSensor)
      {
        gzerr << "CustomSensorPlugin requires a RaySensor.\n";
        return;
      }

      // Initialize ROS if not already initialized
      if (!ros::isInitialized())
      {
        int argc = 0;
        char **argv = NULL;
        ros::init(argc, argv, "gazebo_custom_sensor",
                 ros::init_options::NoSigintHandler);
      }

      // Create ROS node handle
      this->rosNode.reset(new ros::NodeHandle("gazebo_custom_sensor"));

      // Create publisher for sensor data
      this->pub = this->rosNode->advertise<sensor_msgs::Range>(
          "/custom_sensor/range", 1);

      // Connect to sensor update event
      this->updateConnection = this->parentSensor->ConnectUpdated(
          std::bind(&CustomSensorPlugin::OnUpdate, this));

      // Make sure the parent sensor is active
      this->parentSensor->SetActive(true);
    }

    public: void OnUpdate()
    {
      // Get range data from sensor
      double range = this->parentSensor->Range(0);

      // Create and publish ROS message
      sensor_msgs::Range msg;
      msg.header.stamp = ros::Time::now();
      msg.header.frame_id = "custom_sensor_frame";
      msg.radiation_type = sensor_msgs::Range::INFRARED;
      msg.field_of_view = 0.1;
      msg.min_range = 0.01;
      msg.max_range = 10.0;
      msg.range = range;

      this->pub.publish(msg);
    }

    private: sensors::RaySensorPtr parentSensor;
    private: ros::NodeHandlePtr rosNode;
    private: ros::Publisher pub;
    private: event::ConnectionPtr updateConnection;
  };

  // Register this plugin with the simulator
  GZ_REGISTER_SENSOR_PLUGIN(CustomSensorPlugin)
}
```

**Explanation:**
- Custom Gazebo plugin that interfaces with ROS
- Connects simulated sensor data to ROS topics
- Publishes range data in standard ROS message format
- Demonstrates the bridge between simulation and ROS

## Unity ROS Connection Example

This example shows how to connect Unity to ROS using the Unity ROS TCP Connector:

```
// C# script for Unity-ROS connection
// File: UnityROSBridge.cs

using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using Unity.Robotics.ROSTCPConnector;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Std_msgs;
using Unity.Robotics.ROSTCPConnector.MessageTypes.Sensor_msgs;

public class UnityROSBridge : MonoBehaviour
{
    [SerializeField]
    private string rosIPAddress = "127.0.0.1";  // ROS master IP
    [SerializeField]
    private int rosPort = 10000;                // ROS TCP port

    private ROSConnection ros;

    // Publishers
    private string sensorTopic = "unity_sensor_data";
    private string robotPoseTopic = "unity_robot_pose";

    // Subscribers
    private string cmdVelTopic = "cmd_vel";

    void Start()
    {
        // Initialize ROS connection
        ros = ROSConnection.GetOrCreateInstance();
        ros.Initialize(rosIPAddress, rosPort);

        // Register publishers
        ros.RegisterPublisher<UnityRoboticsDemo.SensorData>(sensorTopic);
        ros.RegisterPublisher<UnityRoboticsDemo.RobotPose>(robotPoseTopic);

        // Register subscribers
        ros.Subscribe<UnityRoboticsDemo.Velocity>(cmdVelTopic, OnVelocityCommandReceived);
    }

    void Update()
    {
        // Publish sensor data periodically
        if (Time.frameCount % 60 == 0) // Every 60 frames (approx. 1 Hz if running at 60 FPS)
        {
            PublishSensorData();
            PublishRobotPose();
        }
    }

    void PublishSensorData()
    {
        // Create sensor data message
        var sensorData = new UnityRoboticsDemo.SensorData
        {
            timestamp = Time.time,
            sensor_type = "camera",
            values = new float[] { Random.Range(0f, 1f), Random.Range(0f, 1f) }
        };

        // Publish to ROS
        ros.Publish(sensorTopic, sensorData);
    }

    void PublishRobotPose()
    {
        // Create robot pose message
        var robotPose = new UnityRoboticsDemo.RobotPose
        {
            position_x = transform.position.x,
            position_y = transform.position.y,
            position_z = transform.position.z,
            rotation_x = transform.rotation.x,
            rotation_y = transform.rotation.y,
            rotation_z = transform.rotation.z,
            rotation_w = transform.rotation.w
        };

        // Publish to ROS
        ros.Publish(robotPoseTopic, robotPose);
    }

    void OnVelocityCommandReceived(UnityRoboticsDemo.Velocity velocityCmd)
    {
        // Process velocity command from ROS
        Debug.Log($"Received velocity command: linear={velocityCmd.linear}, angular={velocityCmd.angular}");

        // Apply the command to the robot in Unity
        ApplyVelocityCommand(velocityCmd.linear, velocityCmd.angular);
    }

    void ApplyVelocityCommand(float linear, float angular)
    {
        // Example: Move the Unity object based on velocity command
        transform.Translate(Vector3.forward * linear * Time.deltaTime);
        transform.Rotate(Vector3.up, angular * Time.deltaTime);
    }

    void OnDestroy()
    {
        // Clean up ROS connection
        if (ros != null)
        {
            ros.Disconnect();
        }
    }
}
```

**Explanation:**
- C# script that connects Unity to ROS
- Publishes sensor data and robot pose to ROS topics
- Subscribes to velocity commands from ROS
- Demonstrates bidirectional communication between Unity and ROS

## Unity Perception Example

This example demonstrates how to use Unity Perception for synthetic data generation:

```
// C# script for Unity Perception synthetic data generation
// File: PerceptionCameraSetup.cs

using UnityEngine;
using Unity.Perception.GroundTruth;
using Unity.Simulation;

[RequireComponent(typeof(Camera))]
public class PerceptionCameraSetup : MonoBehaviour
{
    [Header("Synthetic Data Generation")]
    public bool generateSyntheticData = true;
    public int syntheticDatasetCount = 1000;
    public float generationInterval = 0.1f;

    [Header("Annotation Settings")]
    public bool generateBoundingBoxes = true;
    public bool generateSegmentation = true;
    public bool generateDepth = true;

    private Camera perceptionCamera;
    private int currentFrameCount = 0;
    private float lastGenerationTime = 0f;

    void Start()
    {
        perceptionCamera = GetComponent<Camera>();

        if (generateSyntheticData)
        {
            SetupPerceptionCamera();
        }
    }

    void SetupPerceptionCamera()
    {
        // Enable synthetic data generation
        var syntheticDataLabeler = perceptionCamera.gameObject.AddComponent<SyntheticDataLabeler>();

        if (generateBoundingBoxes)
        {
            var boundingBoxLabeler = perceptionCamera.gameObject.AddComponent<BoundingBoxLabeler>();
        }

        if (generateSegmentation)
        {
            var segmentationLabeler = perceptionCamera.gameObject.AddComponent<SegmentationLabeler>();
        }

        if (generateDepth)
        {
            var depthLabeler = perceptionCamera.gameObject.AddComponent<DepthLabeler>();
        }
    }

    void Update()
    {
        if (generateSyntheticData &&
            Time.time - lastGenerationTime >= generationInterval)
        {
            GenerateFrame();
            lastGenerationTime = Time.time;
        }
    }

    void GenerateFrame()
    {
        if (currentFrameCount < syntheticDatasetCount)
        {
            // Trigger synthetic data capture
            SyntheticDataCapture.CaptureNextFrame();
            currentFrameCount++;

            Debug.Log($"Generated synthetic frame {currentFrameCount}/{syntheticDatasetCount}");
        }
        else
        {
            Debug.Log("Synthetic data generation complete!");
            generateSyntheticData = false;
        }
    }
}
```

**Explanation:**
- C# script for Unity Perception synthetic data generation
- Configures camera for synthetic data capture
- Generates various annotation types (bounding boxes, segmentation, depth)
- Demonstrates how to create training data for AI models

## Digital Twin Data Synchronization Example

This example shows how to synchronize data between physical and virtual systems:

```
// Python script for Digital Twin data synchronization
// File: digital_twin_sync.py

#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import JointState
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry
import numpy as np
import time

class DigitalTwinSynchronizer(Node):
    def __init__(self):
        super().__init__('digital_twin_synchronizer')

        # Subscriptions for physical robot data
        self.joint_state_sub = self.create_subscription(
            JointState,
            '/joint_states',
            self.joint_state_callback,
            10)

        self.odom_sub = self.create_subscription(
            Odometry,
            '/odom',
            self.odom_callback,
            10)

        # Publishers for virtual robot commands
        self.cmd_vel_pub = self.create_publisher(
            Twist,
            '/virtual_robot/cmd_vel',
            10)

        # Timer for synchronization
        self.timer = self.create_timer(0.1, self.sync_callback)  # 10 Hz

        # State variables
        self.last_joint_states = None
        self.last_odom = None
        self.virtual_robot_state = {
            'position': [0.0, 0.0, 0.0],
            'orientation': [0.0, 0.0, 0.0, 1.0],
            'joint_positions': []
        }

        self.get_logger().info('Digital Twin Synchronizer started')

    def joint_state_callback(self, msg):
        """Receive joint states from physical robot"""
        self.last_joint_states = {
            'name': msg.name,
            'position': list(msg.position),
            'velocity': list(msg.velocity),
            'effort': list(msg.effort),
            'timestamp': msg.header.stamp.sec + msg.header.stamp.nanosec * 1e-9
        }

        # Update virtual robot state
        self.virtual_robot_state['joint_positions'] = list(msg.position)

    def odom_callback(self, msg):
        """Receive odometry from physical robot"""
        self.last_odom = {
            'position': [
                msg.pose.pose.position.x,
                msg.pose.pose.position.y,
                msg.pose.pose.position.z
            ],
            'orientation': [
                msg.pose.pose.orientation.x,
                msg.pose.pose.orientation.y,
                msg.pose.pose.orientation.z,
                msg.pose.pose.orientation.w
            ],
            'linear_velocity': [
                msg.twist.twist.linear.x,
                msg.twist.twist.linear.y,
                msg.twist.twist.linear.z
            ],
            'angular_velocity': [
                msg.twist.twist.angular.x,
                msg.twist.twist.angular.y,
                msg.twist.twist.angular.z
            ],
            'timestamp': msg.header.stamp.sec + msg.header.stamp.nanosec * 1e-9
        }

        # Update virtual robot state
        self.virtual_robot_state['position'] = self.last_odom['position']
        self.virtual_robot_state['orientation'] = self.last_odom['orientation']

    def sync_callback(self):
        """Synchronize physical and virtual systems"""
        if self.last_odom is not None:
            # Calculate desired virtual robot behavior based on physical state
            cmd_vel = self.calculate_virtual_behavior()

            # Publish command to virtual robot
            self.cmd_vel_pub.publish(cmd_vel)

            # Log synchronization status
            self.get_logger().info(
                f'Synchronized: Physical pos=({self.last_odom["position"][0]:.2f}, '
                f'{self.last_odom["position"][1]:.2f}) Virtual pos=({self.virtual_robot_state["position"][0]:.2f}, '
                f'{self.virtual_robot_state["position"][1]:.2f})'
            )

    def calculate_virtual_behavior(self):
        """Calculate virtual robot behavior based on current state"""
        cmd_vel = Twist()

        # Example: Virtual robot follows physical robot with some offset
        if self.last_odom is not None:
            # Simple proportional controller
            target_x = self.last_odom['position'][0] + 1.0  # 1m ahead
            target_y = self.last_odom['position'][1] + 0.5  # 0.5m to the side

            current_x = self.virtual_robot_state['position'][0]
            current_y = self.virtual_robot_state['position'][1]

            # Calculate desired velocity to reach target
            error_x = target_x - current_x
            error_y = target_y - current_y

            cmd_vel.linear.x = min(0.5, max(-0.5, error_x * 0.5))  # Max 0.5 m/s
            cmd_vel.linear.y = min(0.5, max(-0.5, error_y * 0.5))  # Max 0.5 m/s
            cmd_vel.angular.z = 0.0  # No rotation for this example

        return cmd_vel

def main(args=None):
    rclpy.init(args=args)
    synchronizer = DigitalTwinSynchronizer()

    try:
        rclpy.spin(synchronizer)
    except KeyboardInterrupt:
        pass
    finally:
        synchronizer.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Explanation:**
- Python script that synchronizes data between physical and virtual robots
- Subscribes to joint states and odometry from physical robot
- Publishes commands to virtual robot
- Demonstrates bidirectional data flow in a Digital Twin system

These examples demonstrate the fundamental patterns used in Digital Twin systems. Each example shows how to connect virtual and physical systems, enabling data synchronization and bidirectional communication between the Digital Twin and its physical counterpart.

## Navigation

- [Previous: Digital Twin Theory](./digital_twin_theory)
- [Next: Digital Twin Exercises](./digital_twin_exercises)
- [Module 2 Home](./index)