---
title: ROS 2 Exercises
sidebar_position: 6
description: Practice exercises with solutions for ROS 2 concepts
tags: [ros2, exercises, practice, problems]
---

# ROS 2 Exercises

## Exercise 1: Simple Publisher/Subscriber Pair

<div class="exercise-block">
### Problem Statement
Create a simple ROS 2 publisher node that publishes the current time (in seconds) to a topic called "current_time" every second. Then create a subscriber node that listens to this topic and logs the received time values.
</div>

### Getting Started
Don't worry if this seems challenging at first! This exercise is designed to help you apply what you've learned about publishers and subscribers. You can reference the code examples in the previous section as a guide. Take it one step at a time.

### Prerequisites
- Understanding of basic ROS 2 node structure
- Knowledge of publishers and subscribers
- Basic Python or C++ programming skills

### Exercise
1. Create a publisher node that:
   - Publishes `std_msgs/Float64` messages containing the current time
   - Publishes to the topic "current_time"
   - Publishes at 1 Hz (every second)
   - Logs each published value

2. Create a subscriber node that:
   - Subscribes to the "current_time" topic
   - Receives `std_msgs/Float64` messages
   - Logs the received time values
   - Compares the time difference between consecutive messages

3. Create a launch file that starts both nodes simultaneously.

### Hints
- Use `time.time()` to get the current time in Python
- Use `rclpy.clock.Clock().now().seconds_nanoseconds()` in ROS 2 to get time
- Remember to initialize and spin your nodes
- Consider the appropriate QoS settings for time-critical data

### Solution

**Publisher Node:**

```
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float64
import time

class TimePublisher(Node):

    def __init__(self):
        super().__init__('time_publisher')
        self.publisher_ = self.create_publisher(Float64, 'current_time', 10)
        timer_period = 1.0  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)

    def timer_callback(self):
        msg = Float64()
        msg.data = time.time()
        self.publisher_.publish(msg)
        self.get_logger().info('Publishing time: %.2f' % msg.data)

def main(args=None):
    rclpy.init(args=args)
    time_publisher = TimePublisher()
    rclpy.spin(time_publisher)
    time_publisher.destroy_node()
    rclpy.shutdown()
```

**Subscriber Node:**

```
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float64

class TimeSubscriber(Node):

    def __init__(self):
        super().__init__('time_subscriber')
        self.subscription = self.create_subscription(
            Float64,
            'current_time',
            self.listener_callback,
            10)
        self.last_time = None
        self.subscription  # prevent unused variable warning

    def listener_callback(self, msg):
        current_time = msg.data
        if self.last_time is not None:
            time_diff = current_time - self.last_time
            self.get_logger().info('Received time: %.2f, Time diff: %.2f' % (current_time, time_diff))
        else:
            self.get_logger().info('Received time: %.2f' % current_time)

        self.last_time = current_time

def main(args=None):
    rclpy.init(args=args)
    time_subscriber = TimeSubscriber()
    rclpy.spin(time_subscriber)
    time_subscriber.destroy_node()
    rclpy.shutdown()
```

**Launch File (Python):**

```
from launch import LaunchDescription
from launch_ros.actions import Node

def generate_launch_description():
    return LaunchDescription([
        Node(
            package='your_package_name',
            executable='time_publisher',
            name='time_publisher'
        ),
        Node(
            package='your_package_name',
            executable='time_subscriber',
            name='time_subscriber'
        )
    ])
```

### Validation Criteria
- Publisher correctly publishes time values every second
- Subscriber correctly receives and logs time values
- Time difference between consecutive messages is approximately 1 second
- Both nodes run without errors
- Launch file successfully starts both nodes

---

## Exercise 2: Service-Based Calculator

### Problem Statement
Create a custom ROS 2 service that performs basic arithmetic operations (addition, subtraction, multiplication, division). The service should accept two numbers and an operation type, then return the result.

### Prerequisites
- Understanding of ROS 2 services
- Knowledge of creating custom message types
- Experience with service servers and clients

### Exercise
1. Define a custom service interface with:
   - Request: two floating-point numbers and operation type
   - Response: result of the operation
   - Add error handling for invalid operations (like division by zero)

2. Create a service server that:
   - Implements all four arithmetic operations
   - Handles edge cases (like division by zero)
   - Logs each request and response

3. Create a service client that:
   - Tests all four operations with different inputs
   - Tests error conditions (like division by zero)
   - Validates results

### Hints
- Create a `.srv` file in your package's `srv/` directory
- The format is: `request_fields --- response_fields`
- Handle exceptions for invalid operations
- Consider using string enums for operation types

### Solution

**Custom Service Definition (calculate.srv):**

```
# Request
float64 a
float64 b
string operation # 'add', 'subtract', 'multiply', 'divide'

---
# Response
float64 result
bool success
string error_message
```

**Service Server:**

```
import rclpy
from rclpy.node import Node
from your_package.srv import Calculate  # Replace with your package name

class CalculatorService(Node):

    def __init__(self):
        super().__init__('calculator_service')
        self.srv = self.create_service(Calculate, 'calculate', self.calculate_callback)

    def calculate_callback(self, request, response):
        a = request.a
        b = request.b
        op = request.operation

        if op == 'add':
            response.result = a + b
            response.success = True
        elif op == 'subtract':
            response.result = a - b
            response.success = True
        elif op == 'multiply':
            response.result = a * b
            response.success = True
        elif op == 'divide':
            if b == 0.0:
                response.success = False
                response.error_message = 'Division by zero'
            else:
                response.result = a / b
                response.success = True
        else:
            response.success = False
            response.error_message = f'Unknown operation: {op}'

        if response.success:
            self.get_logger().info(f'{a} {op} {b} = {response.result}')
        else:
            self.get_logger().info(f'Error: {response.error_message}')

        return response

def main(args=None):
    rclpy.init(args=args)
    calculator_service = CalculatorService()
    rclpy.spin(calculator_service)
    rclpy.shutdown()
```

### Validation Criteria
- Service correctly performs all four arithmetic operations
- Proper error handling for invalid operations
- Service returns appropriate success/error responses
- Client successfully tests all operations
- No runtime errors during execution

---

## Exercise 3: Action-Based Navigation

### Problem Statement
Create a navigation action server that simulates moving a robot to a specified 2D position. The action should provide feedback on the robot's progress and return the final result when the goal is reached or cancelled.

### Prerequisites
- Understanding of ROS 2 actions
- Knowledge of goal, feedback, and result concepts
- Basic understanding of navigation concepts

### Exercise
1. Define a custom action interface with:
   - Goal: target x, y coordinates
   - Feedback: current x, y coordinates and progress percentage
   - Result: success flag and final distance to goal

2. Create an action server that:
   - Simulates robot movement toward the target
   - Provides regular feedback on progress
   - Supports goal cancellation
   - Handles multiple concurrent goals

3. Create an action client that:
   - Sends navigation goals to the server
   - Monitors feedback during execution
   - Handles the final result
   - Tests goal cancellation

### Hints
- Create a `.action` file in your package's `action/` directory
- The format is: goal, result, feedback sections
- Simulate movement by gradually changing position toward target
- Calculate Euclidean distance for progress tracking

### Solution

**Custom Action Definition (Navigate.action):**

```
# Goal
float64 target_x
float64 target_y
float64 tolerance

---
# Result
bool success
float64 final_distance
string message

---
# Feedback
float64 current_x
float64 current_y
float64 distance_to_goal
int32 progress_percentage
```

**Action Server:**

```
import time
import rclpy
from rclpy.action import ActionServer, CancelResponse
from rclpy.node import Node
from your_package.action import Navigate  # Replace with your package name
import math

class NavigationActionServer(Node):

    def __init__(self):
        super().__init__('navigation_action_server')
        self._action_server = ActionServer(
            self,
            Navigate,
            'navigate_to_pose',
            self.execute_callback,
            cancel_callback=self.cancel_callback)

    def cancel_callback(self, goal_handle):
        self.get_logger().info('Received cancel request')
        return CancelResponse.ACCEPT

    def execute_callback(self, goal_handle):
        self.get_logger().info('Executing navigation goal...')

        # Start at current position (0, 0)
        current_x, current_y = 0.0, 0.0
        target_x = goal_handle.request.target_x
        target_y = goal_handle.request.target_y
        tolerance = goal_handle.request.tolerance

        # Calculate total distance
        total_distance = math.sqrt((target_x - current_x)**2 + (target_y - current_y)**2)

        feedback_msg = Navigate.Feedback()
        result_msg = Navigate.Result()

        # Simulate movement
        steps = 20  # Number of steps to reach target
        for i in range(steps + 1):
            # Check if goal was cancelled
            if goal_handle.is_cancel_requested:
                goal_handle.canceled()
                result_msg.success = False
                result_msg.final_distance = math.sqrt((target_x - current_x)**2 + (target_y - current_y)**2)
                result_msg.message = 'Goal was cancelled'
                self.get_logger().info('Goal was cancelled')
                return result_msg

            # Calculate current position (linear interpolation)
            progress = i / steps
            current_x = progress * target_x
            current_y = progress * target_y

            # Calculate distance to goal
            distance_to_goal = math.sqrt((target_x - current_x)**2 + (target_y - current_y)**2)

            # Prepare feedback
            feedback_msg.current_x = current_x
            feedback_msg.current_y = current_y
            feedback_msg.distance_to_goal = distance_to_goal
            feedback_msg.progress_percentage = int(progress * 100)

            # Publish feedback
            goal_handle.publish_feedback(feedback_msg)

            # Log progress
            self.get_logger().info(f'Progress: {feedback_msg.progress_percentage}% - Distance to goal: {distance_to_goal:.2f}')

            # Sleep to simulate movement time
            time.sleep(0.2)

            # Check if reached target
            if distance_to_goal <= tolerance:
                break

        # Check if successful
        if distance_to_goal <= tolerance:
            goal_handle.succeed()
            result_msg.success = True
            result_msg.final_distance = distance_to_goal
            result_msg.message = f'Goal reached successfully at ({current_x:.2f}, {current_y:.2f})'
            self.get_logger().info(result_msg.message)
        else:
            goal_handle.abort()
            result_msg.success = False
            result_msg.final_distance = distance_to_goal
            result_msg.message = f'Goal aborted. Final distance: {distance_to_goal:.2f}'
            self.get_logger().info(result_msg.message)

        return result_msg

def main(args=None):
    rclpy.init(args=args)
    navigation_action_server = NavigationActionServer()
    rclpy.spin(navigation_action_server)
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

### Validation Criteria
- Action server correctly simulates navigation to target position
- Feedback is provided at regular intervals during execution
- Goal cancellation is properly handled
- Result is returned with appropriate success/failure status
- Action client can successfully send goals and receive feedback

These exercises provide hands-on practice with the core concepts of ROS 2, allowing you to implement and test different communication patterns in a simulated environment.

## Navigation

- [Previous: Code Examples](./ros2_examples)
- [Module 1 Home](./index)