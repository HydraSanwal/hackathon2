---
title: ROS 2 Code Examples
sidebar_position: 5
description: Text-based code examples demonstrating ROS 2 concepts
tags: [ros2, examples, code, implementation]
---

# ROS 2 Code Examples

## Overview

<div class="code-example">
This section provides text-based code examples that demonstrate the practical implementation of ROS 2 concepts. These examples are provided as text-only snippets that illustrate how to implement various ROS 2 patterns without executable functionality.
</div>

### How to Use These Examples
Don't worry if the code looks complex at first! Each example is broken down with detailed explanations. Focus on understanding the concepts and patterns rather than memorizing every line of code. As you progress through the module, these examples will become clearer.

## Basic Publisher Example

The following example demonstrates how to create a simple publisher node in Python:

```
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class Talker(Node):

    def __init__(self):
        super().__init__('talker')
        self.publisher_ = self.create_publisher(String, 'chatter', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = 'Hello World: %d' % self.i
        self.publisher_.publish(msg)
        self.get_logger().info('Publishing: "%s"' % msg.data)
        self.i += 1

def main(args=None):
    rclpy.init(args=args)
    talker = Talker()
    rclpy.spin(talker)
    talker.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Explanation:**
- The `Talker` class inherits from `Node`, creating a ROS 2 node
- `create_publisher()` creates a publisher that sends `String` messages to the 'chatter' topic
- A timer is created that calls `timer_callback` every 0.5 seconds
- In the callback, a message is created, published, and logged

## Basic Subscriber Example

This example shows how to create a subscriber node that receives messages:

```
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class Listener(Node):

    def __init__(self):
        super().__init__('listener')
        self.subscription = self.create_subscription(
            String,
            'chatter',
            self.listener_callback,
            10)
        self.subscription  # prevent unused variable warning

    def listener_callback(self, msg):
        self.get_logger().info('I heard: "%s"' % msg.data)

def main(args=None):
    rclpy.init(args=args)
    listener = Listener()
    rclpy.spin(listener)
    listener.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Explanation:**
- The `Listener` class creates a subscription to the 'chatter' topic
- The callback function processes incoming messages and logs them
- The subscriber runs continuously, waiting for messages

## Service Server Example

This example demonstrates how to create a service that adds two integers:

```
from example_interfaces.srv import AddTwoInts
import rclpy
from rclpy.node import Node

class MinimalService(Node):

    def __init__(self):
        super().__init__('minimal_service')
        self.srv = self.create_service(AddTwoInts, 'add_two_ints', self.add_two_ints_callback)

    def add_two_ints_callback(self, request, response):
        response.sum = request.a + request.b
        self.get_logger().info('Incoming request\na: %d b: %d' % (request.a, request.b))
        return response

def main(args=None):
    rclpy.init(args=args)
    minimal_service = MinimalService()
    rclpy.spin(minimal_service)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Explanation:**
- Creates a service server that listens on the 'add_two_ints' service
- The callback function receives a request with two integers and returns their sum
- The service runs continuously, processing requests as they arrive

## Service Client Example

This example shows how to call the service from a client:

```
from example_interfaces.srv import AddTwoInts
import rclpy
from rclpy.node import Node

class MinimalClient(Node):

    def __init__(self):
        super().__init__('minimal_client')
        self.cli = self.create_client(AddTwoInts, 'add_two_ints')
        while not self.cli.wait_for_service(timeout_sec=1.0):
            self.get_logger().info('service not available, waiting again...')
        self.req = AddTwoInts.Request()

    def send_request(self, a, b):
        self.req.a = a
        self.req.b = b
        self.future = self.cli.call_async(self.req)
        rclpy.spin_until_future_complete(self, self.future)
        return self.future.result()

def main(args=None):
    rclpy.init(args=args)
    minimal_client = MinimalClient()
    response = minimal_client.send_request(1, 2)
    minimal_client.get_logger().info(
        'Result of add_two_ints: %d' % response.sum)
    minimal_client.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Explanation:**
- Creates a client that connects to the 'add_two_ints' service
- Waits for the service to become available
- Sends a request with two integers and waits for the response
- Logs the result of the computation

## Action Server Example

This example demonstrates a Fibonacci sequence action server:

```
import time
import rclpy
from rclpy.action import ActionServer
from rclpy.node import Node
from example_interfaces.action import Fibonacci

class FibonacciActionServer(Node):

    def __init__(self):
        super().__init__('fibonacci_action_server')
        self._action_server = ActionServer(
            self,
            Fibonacci,
            'fibonacci',
            self.execute_callback)

    def execute_callback(self, goal_handle):
        self.get_logger().info('Executing goal...')

        feedback_msg = Fibonacci.Feedback()
        feedback_msg.sequence = [0, 1]

        for i in range(1, goal_handle.request.order):
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                self.get_logger().info('Goal canceled')
                return Fibonacci.Result()

            feedback_msg.sequence.append(
                feedback_msg.sequence[i] + feedback_msg.sequence[i-1])

            goal_handle.publish_feedback(feedback_msg)
            time.sleep(1)

        goal_handle.succeed()
        result = Fibonacci.Result()
        result.sequence = feedback_msg.sequence
        self.get_logger().info('Returning result: {0}'.format(result.sequence))
        return result

def main(args=None):
    rclpy.init(args=args)
    fibonacci_action_server = FibonacciActionServer()
    rclpy.spin(fibonacci_action_server)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Explanation:**
- Creates an action server that calculates Fibonacci sequences
- Provides feedback during the calculation process
- Supports cancellation of the goal
- Returns the complete sequence when finished

## Quality of Service (QoS) Example

This example shows how to configure QoS settings for different communication needs:

```
import rclpy
from rclpy.node import Node
from std_msgs.msg import String
from rclpy.qos import QoSProfile, ReliabilityPolicy, HistoryPolicy

class QoSPublisher(Node):

    def __init__(self):
        super().__init__('qos_publisher')

        # Reliable communication for critical data
        reliable_qos = QoSProfile(
            depth=10,
            reliability=ReliabilityPolicy.RELIABLE,
            history=HistoryPolicy.KEEP_LAST
        )

        # Best effort for high-frequency sensor data
        best_effort_qos = QoSProfile(
            depth=5,
            reliability=ReliabilityPolicy.BEST_EFFORT,
            history=HistoryPolicy.KEEP_LAST
        )

        self.reliable_publisher = self.create_publisher(String, 'critical_data', reliable_qos)
        self.best_effort_publisher = self.create_publisher(String, 'sensor_data', best_effort_qos)

def main(args=None):
    rclpy.init(args=args)
    qos_publisher = QoSPublisher()
    rclpy.spin(qos_publisher)
    qos_publisher.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Explanation:**
- Demonstrates two different QoS profiles for different data types
- Critical data uses reliable delivery to ensure all messages arrive
- Sensor data uses best effort for better performance with high-frequency data

## Launch File Example

Launch files allow you to start multiple nodes together. Here's an XML example:

```
<launch>
  <node pkg="demo_nodes_py" exec="talker" name="publisher" output="screen"/>
  <node pkg="demo_nodes_py" exec="listener" name="subscriber" output="screen"/>
  <param name="use_sim_time" value="true"/>
</launch>
```

**Explanation:**
- Launch file starts both publisher and subscriber nodes
- Output is directed to screen for debugging
- Parameters can be set globally for all nodes

These examples demonstrate the fundamental patterns used in ROS 2 systems. Each example shows how to implement a specific communication pattern while following ROS 2 best practices for node design and communication.

## Navigation

- [Previous: Nodes and Communication Patterns](./ros2_nodes)
- [Next: Exercises](./ros2_exercises)
- [Module 1 Home](./index)