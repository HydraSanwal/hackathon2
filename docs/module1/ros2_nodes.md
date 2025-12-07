---
title: ROS 2 Nodes and Communication Patterns
sidebar_position: 4
description: Understanding nodes, topics, services, and actions in ROS 2
tags: [ros2, nodes, communication, patterns]
---

# ROS 2 Nodes and Communication Patterns

## Understanding Nodes

<div class="theory-section">
A node is a fundamental component in ROS 2 that performs computation. Think of nodes as individual programs that work together to create a complete robotic system.
</div>

### Real-World Analogy
Imagine a human body: different organs have specific functions (heart pumps blood, lungs process oxygen, brain processes information), but they all work together as a system. In ROS 2, nodes are like these organs - each performs a specific function but communicates with others to achieve complex behavior.

### Node Characteristics

- **Single Responsibility**: Each node typically performs one specific function
- **Lightweight**: Nodes are designed to be efficient and focused
- **Communicative**: Nodes communicate with other nodes through ROS 2 interfaces
- **Language Agnostic**: Nodes can be written in different programming languages
- **Distributed**: Nodes can run on the same or different machines

### Node Lifecycle

ROS 2 nodes can have different lifecycle states:
- **Unconfigured**: Node is created but not yet configured
- **Inactive**: Node is configured but not active
- **Active**: Node is running and processing data
- **Finalized**: Node is shutting down

## Creating Nodes

### Python Example

```python
import rclpy
from rclpy.node import Node

class MinimalPublisher(Node):

    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
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
    minimal_publisher = MinimalPublisher()
    rclpy.spin(minimal_publisher)
    minimal_publisher.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### C++ Example

```cpp
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/string.hpp"

using std::placeholders::_1;

class MinimalPublisher : public rclcpp::Node
{
public:
  MinimalPublisher()
  : Node("minimal_publisher"), count_(0)
  {
    publisher_ = this->create_publisher<std_msgs::msg::String>("topic", 10);
    timer_ = this->create_wall_timer(
      500ms, std::bind(&MinimalPublisher::timer_callback, this));
  }

private:
  void timer_callback()
  {
    auto message = std_msgs::msg::String();
    message.data = "Hello, world! " + std::to_string(count_++);
    RCLCPP_INFO(this->get_logger(), "Publishing: '%s'", message.data.c_str());
    publisher_->publish(message);
  }
  rclcpp::TimerBase::SharedPtr timer_;
  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr publisher_;
  size_t count_;
};
```

## Communication Patterns

### 1. Topics (Publish-Subscribe)

Topics use a publish-subscribe communication pattern where publishers send messages to topics and subscribers receive messages from topics.

#### Publisher Example (Python)

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class Talker(Node):

    def __init__(self):
        super().__init__('talker')
        self.publisher = self.create_publisher(String, 'chatter', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = 'Hello World: %d' % self.i
        self.publisher.publish(msg)
        self.get_logger().info('Publishing: "%s"' % msg.data)
        self.i += 1
```

#### Subscriber Example (Python)

```python
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
```

### 2. Services (Request-Response)

Services provide a request-response communication pattern where clients send requests to services and receive responses.

#### Service Server Example (Python)

```python
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
```

#### Service Client Example (Python)

```python
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
```

### 3. Actions (Goal-Feedback-Result)

Actions are used for long-running tasks that provide feedback and can be canceled.

#### Action Server Example (Python)

```python
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
```

## Quality of Service (QoS) in Communication

QoS settings allow fine-tuning of communication behavior:

### Reliability Settings

```python
from rclpy.qos import QoSProfile, ReliabilityPolicy

# Reliable communication (messages will be retried if lost)
reliable_qos = QoSProfile(
    depth=10,
    reliability=ReliabilityPolicy.RELIABLE
)

# Best effort communication (faster, but messages may be lost)
best_effort_qos = QoSProfile(
    depth=10,
    reliability=ReliabilityPolicy.BEST_EFFORT
)

# Create publisher with specific QoS
publisher = node.create_publisher(String, 'topic', reliable_qos)
```

### History Settings

```python
from rclpy.qos import QoSProfile, HistoryPolicy

# Keep only the last 5 messages
last_5_qos = QoSProfile(
    depth=5,
    history=HistoryPolicy.KEEP_LAST
)

# Keep all messages (use with caution - memory intensive)
all_qos = QoSProfile(
    depth=0,  # 0 means unlimited
    history=HistoryPolicy.KEEP_ALL
)
```

## Node Communication Best Practices

### 1. Naming Conventions
- Use descriptive names that indicate the node's function
- Use underscores for multi-word names: `camera_driver`, `path_planner`
- Include robot name if multiple robots: `robot1_camera_driver`

### 2. Topic Naming
- Use descriptive topic names: `/sensors/camera/image_raw` instead of `/img`
- Group related topics: `/robot1/sensors/`, `/robot1/control/`
- Use standard message types when possible

### 3. Message Design
- Keep messages simple and focused
- Use appropriate data types for efficiency
- Document message contents clearly

### 4. Error Handling
- Handle connection failures gracefully
- Implement timeouts for blocking operations
- Log errors appropriately for debugging

## Practical Considerations

### Performance Optimization
- Choose appropriate QoS settings for your use case
- Use efficient message types for high-frequency data
- Consider message compression for large data

### Debugging
- Use `ros2 topic echo` to monitor topic data
- Use `ros2 service call` to test services
- Use `ros2 action send_goal` to test actions

### Testing
- Write unit tests for individual nodes
- Test communication patterns thoroughly
- Validate message content and timing

In the next section, we'll look at practical code examples that demonstrate these concepts in action.

## Navigation

- [Previous: ROS 2 Architecture](./ros2_architecture)
- [Next: Code Examples](./ros2_examples)
- [Module 1 Home](./index)