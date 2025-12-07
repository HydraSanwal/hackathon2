---
title: Gazebo Simulation Basics
sidebar_position: 2
description: Understanding the fundamentals of Gazebo simulation platform
tags: [gazebo, simulation, robotics, physics-engine]
---

# Gazebo Simulation Basics

<div class="theory-section">
Gazebo is a 3D dynamic simulator that provides realistic simulation of robots and their environments. It's widely used in robotics research and development for testing algorithms, robot designs, and control systems in a safe, reproducible virtual environment.
</div>

## What is Gazebo?

Gazebo is an open-source robotics simulator that provides:
- Realistic physics simulation using ODE, Bullet, and Simbody engines
- High-quality 3D graphics rendering
- Support for various sensors (cameras, lidar, IMU, etc.)
- Integration with ROS and ROS 2
- Plugin architecture for custom functionality
- Large library of pre-built models and environments

### A Simple Analogy
Think of Gazebo as a "flight simulator" for robots. Just as pilots train in flight simulators before flying real aircraft, roboticists test their algorithms and robot behaviors in Gazebo before deploying them on physical robots.

## Key Features of Gazebo

### 1. Physics Simulation
Gazebo provides realistic physics simulation including:
- Collision detection
- Contact simulation
- Friction and damping
- Gravity and other forces
- Rigid body dynamics

### 2. Sensor Simulation
Gazebo can simulate various sensors:
- **Cameras**: RGB, depth, stereo cameras
- **LIDAR**: 2D and 3D laser range finders
- **IMU**: Inertial measurement units
- **GPS**: Global positioning system
- **Force/Torque sensors**: For contact and interaction forces
- **Joint sensors**: For position, velocity, and effort

### 3. Model and Environment Library
Gazebo comes with a large library of:
- Robot models (PR2, TurtleBot, etc.)
- Objects and furniture
- Environments and worlds
- Sensors and actuators

### 4. Plugin Architecture
Gazebo supports plugins for:
- Custom sensors
- Control systems
- Physics engines
- GUI elements
- Communication interfaces

## Gazebo Architecture

### Server Component
- **gzserver**: Runs the physics simulation and handles models
- Runs in background, headless mode possible
- Handles all simulation calculations

### Client Component
- **gzclient**: Provides the graphical user interface
- Visualizes the simulation in real-time
- Allows user interaction with the simulation

## Gazebo World Format

Gazebo worlds are defined using SDF (Simulation Description Format), an XML-based format:

```
<?xml version="1.0" ?>
<sdf version="1.7">
  <world name="default">
    <!-- Include a model from the database -->
    <include>
      <uri>model://ground_plane</uri>
    </include>

    <!-- Add a light source -->
    <light type="directional" name="sun">
      <cast_shadows>true</cast_shadows>
      <pose>0 0 10 0 0 0</pose>
      <diffuse>0.8 0.8 0.8 1</diffuse>
      <specular>0.2 0.2 0.2 1</specular>
      <attenuation>
        <range>1000</range>
        <constant>0.9</constant>
        <linear>0.01</linear>
        <quadratic>0.001</quadratic>
      </attenuation>
      <direction>-0.5 0.1 -0.9</direction>
    </light>

    <!-- Add a ground plane -->
    <model name="ground_plane">
      <static>true</static>
      <link name="link">
        <collision name="collision">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
            </plane>
          </geometry>
        </collision>
        <visual name="visual">
          <geometry>
            <plane>
              <normal>0 0 1</normal>
              <size>100 100</size>
            </plane>
          </geometry>
        </visual>
      </link>
    </model>
  </world>
</sdf>
```

## Robot Model Description

Robots in Gazebo are described using URDF (Unified Robot Description Format) or SDF:

```
<?xml version="1.0"?>
<robot name="simple_robot">
  <!-- Base link -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.5 0.5 0.2"/>
      </geometry>
      <material name="blue">
        <color rgba="0 0 1 1"/>
      </material>
    </visual>
    <collision>
      <geometry>
        <box size="0.5 0.5 0.2"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1"/>
      <inertia ixx="0.1" ixy="0" ixz="0" iyy="0.1" iyz="0" izz="0.1"/>
    </inertial>
  </link>

  <!-- Wheel links -->
  <link name="wheel_1">
    <visual>
      <geometry>
        <cylinder length="0.1" radius="0.1"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <cylinder length="0.1" radius="0.1"/>
      </geometry>
    </collision>
  </link>

  <!-- Joint connecting wheel to base -->
  <joint name="wheel_1_joint" type="continuous">
    <parent link="base_link"/>
    <child link="wheel_1"/>
    <origin xyz="0.2 0.2 -0.1" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
  </joint>
</robot>
```

## Integration with ROS 2

Gazebo integrates seamlessly with ROS 2 through:
- **Gazebo ROS packages**: Provide ROS 2 interfaces for Gazebo
- **Topic publishing**: Sensor data published to ROS 2 topics
- **Service calls**: Control and simulation management
- **Action interfaces**: For complex simulation tasks
- **TF frames**: Robot transforms published to TF tree

## Common Gazebo Commands

### Starting Gazebo
```bash
# Start Gazebo with empty world
gz sim

# Start Gazebo with a specific world
gz sim -r empty.sdf

# Start Gazebo in headless mode (no GUI)
gz sim -s
```

### Controlling Simulation
```bash
# Pause simulation
gz service -s /world/default/control --req-type gz.msgs.WorldControl --req 'pause: true'

# Resume simulation
gz service -s /world/default/control --req-type gz.msgs.WorldControl --req 'pause: false'

# Reset simulation
gz service -s /world/default/control --req-type gz.msgs.WorldControl --req 'reset: true'
```

## Best Practices for Gazebo Simulation

### 1. Model Quality
- Use appropriate level of detail for your application
- Ensure collision and visual meshes are properly defined
- Verify inertial properties for realistic physics

### 2. Performance Optimization
- Simplify collision meshes where possible
- Use appropriate physics engine parameters
- Limit the number of active sensors during simulation

### 3. Realism vs. Performance
- Balance simulation accuracy with computational requirements
- Use realistic but not overly complex models
- Validate simulation results against real-world data

## Challenges and Limitations

### The Reality Gap
- Differences between simulation and real-world physics
- Sensor noise and accuracy modeling
- Environmental factors difficult to simulate

### Computational Requirements
- High-quality physics simulation requires significant computational resources
- Real-time performance may be challenging for complex scenarios

## Navigation

- [Previous: Module 2 Overview](./index)
- [Next: Unity Integration](./unity_integration)
- [Module 2 Home](./index)