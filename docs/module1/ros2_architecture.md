---
title: ROS 2 Architecture
sidebar_position: 3
description: Understanding the architectural design of Robot Operating System 2
tags: [ros2, architecture, design, communication]
---

# ROS 2 Architecture

## Overview of ROS 2 Architecture

<div class="theory-section">
ROS 2 follows a distributed computing architecture that enables multiple processes (nodes) to communicate with each other over a network. Think of it like a city where different services (police, fire department, hospitals) need to communicate with each other when responding to incidents. The architecture is built around the Data Distribution Service (DDS) standard, which provides a publish-subscribe communication model.
</div>

### Why Architecture Matters
Understanding the architecture is important because it determines how different parts of your robot communicate. Just like how the layout of a house affects how people move through it, ROS 2's architecture affects how information flows through your robot system.

## Core Architecture Components

### 1. Nodes
Nodes are the fundamental building blocks of ROS 2 applications. A node is a process that performs computation and communicates with other nodes. Key characteristics:

- Each node runs a specific function (sensor processing, control, planning, etc.)
- Nodes are lightweight and can be distributed across multiple machines
- Nodes can be written in different programming languages
- Nodes communicate through topics, services, and actions

### 2. DDS Implementation
ROS 2 uses DDS (Data Distribution Service) as its communication middleware:

- **Implementation Agnostic**: ROS 2 can work with different DDS implementations (Fast DDS, Cyclone DDS, RTI Connext)
- **Quality of Service (QoS)**: Configurable delivery guarantees for different types of data
- **Discovery**: Automatic discovery of nodes and their interfaces
- **Reliability**: Built-in mechanisms for reliable message delivery

### 3. Client Libraries
ROS 2 provides client libraries for different programming languages:

- **rclcpp**: C++ client library
- **rclpy**: Python client library
- **rcljava**: Java client library
- **rclnodejs**: Node.js client library

## Communication Patterns

### Topics and Publishers/Subscribers
The publish-subscribe pattern is the most common communication method:

```
[Publisher Node] -----> [Topic] -----> [Subscriber Node]
```

- Publishers send messages to topics
- Subscribers receive messages from topics
- Many-to-many communication is possible
- Messages are sent without knowing who will receive them

### Services and Clients
The request-response pattern for synchronous communication:

```
[Client Node] <-----> [Service Node]
    Request              Response
```

- Client sends a request and waits for a response
- Service processes the request and sends a response
- One-to-one synchronous communication
- Used for operations that require a direct response

### Actions
Long-running tasks with feedback and cancellation:

```
[Action Client] <-----> [Action Server]
    Goal                    Feedback
                            Result
                            Cancel
```

- Used for tasks that take significant time
- Provides feedback during execution
- Supports cancellation of ongoing tasks
- Includes goal, result, and feedback messages

## Quality of Service (QoS) Settings

QoS settings allow fine-tuning communication behavior:

### Reliability Policy
- **Reliable**: All messages will be delivered (with retries)
- **Best Effort**: Messages may be lost (faster, less overhead)

### Durability Policy
- **Transient Local**: Late-joining subscribers receive last known value
- **Volatile**: Late-joining subscribers only receive new messages

### History Policy
- **Keep Last**: Maintain only the most recent N messages
- **Keep All**: Maintain all messages (memory intensive)

### Lifespan and Deadline
- **Lifespan**: How long messages remain valid
- **Deadline**: Expected time for message delivery

## Practical Architecture Example

Here's a simple example of how nodes might be organized in a robotic system:

```
[Sensor Drivers]     [Perception]     [Planning]
      |                   |               |
      v                   v               v
[Camera Data] ----> [Object Detection] ----> [Path Planning]
      |                   |               |
      v                   v               v
[Lidar Data]  ----> [Localization]  ----> [Motion Control]
```

## Launch System

ROS 2 provides a launch system to start multiple nodes together:

- **Launch Files**: XML or Python files that define which nodes to start
- **Parameters**: Configuration values passed to nodes at startup
- **Lifecycle Management**: Coordinated startup and shutdown of nodes

## Package Structure

ROS 2 packages follow a standardized structure:

```
package_name/
├── CMakeLists.txt          # Build configuration for C++
├── package.xml             # Package metadata
├── src/                    # Source code
├── include/package_name/   # Header files
├── launch/                 # Launch files
├── config/                 # Configuration files
├── test/                   # Test files
└── scripts/                # Executable scripts
```

## Namespaces and Naming

ROS 2 uses a hierarchical naming system:

- **Global Namespace**: `/robot1/sensors/camera`
- **Relative Names**: `sensors/camera` (relative to node's namespace)
- **Private Parameters**: `~node_name/parameter_name`

## Security Architecture

ROS 2 includes security features:

- **Authentication**: Verify node identity
- **Authorization**: Control access to topics/services
- **Encryption**: Encrypt data in transit
- **Secure Communication**: End-to-end security

## Advantages of This Architecture

1. **Modularity**: Components can be developed and tested independently
2. **Scalability**: Systems can be distributed across multiple machines
3. **Flexibility**: Easy to swap components or add new functionality
4. **Language Independence**: Different nodes can be written in different languages
5. **Standardization**: Common interfaces enable code reuse and collaboration

In the next section, we'll explore how to implement these concepts in practice with actual ROS 2 code examples.

## Navigation

- [Previous: Introduction to ROS 2](./ros2_intro)
- [Next: Nodes and Communication Patterns](./ros2_nodes)
- [Module 1 Home](./index)