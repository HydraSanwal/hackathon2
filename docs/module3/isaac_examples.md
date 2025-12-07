---
title: Isaac Code Examples
sidebar_position: 5
description: Text-based code examples demonstrating NVIDIA Isaac concepts
tags: [nvidia-isaac, examples, code, ai-robotics, implementation]
---

# Isaac Code Examples

<div class="code-example">
This section provides text-based code examples that demonstrate the practical implementation of NVIDIA Isaac concepts. These examples illustrate how to implement AI-powered robotics applications using the Isaac platform, including perception, planning, and control systems.
</div>

### How to Use These Examples
These examples show how to implement AI and robotics concepts using the Isaac platform. Focus on understanding the patterns for integrating AI with robotic systems, rather than memorizing every line of code.

## Isaac ROS Image Pipeline Example

This example demonstrates how to set up an Isaac ROS image processing pipeline:

```
# Launch file for Isaac ROS image processing pipeline
# File: launch/isaac_ros_image_pipeline.launch.py

from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.conditions import IfCondition
from launch.substitutions import LaunchConfiguration, PythonExpression
from launch_ros.actions import ComposableNodeContainer
from launch_ros.descriptions import ComposableNode

def generate_launch_description():
    # Launch arguments
    enable_rectification = LaunchConfiguration('enable_rectification', default='True')
    input_width = LaunchConfiguration('input_width', default='1920')
    input_height = LaunchConfiguration('input_height', default='1200')

    # Isaac ROS Image Pipeline container
    image_pipeline_container = ComposableNodeContainer(
        name='image_pipeline_container',
        namespace='',
        package='rclcpp_components',
        executable='component_container_mt',
        composable_node_descriptions=[
            # Image Rectification
            ComposableNode(
                package='isaac_ros_image_proc',
                plugin='nvidia::isaac_ros::image_proc::RectifyNode',
                name='rectify_node',
                parameters=[{
                    'output_width': input_width,
                    'output_height': input_height,
                    'flip_horizontal': False,
                    'flip_vertical': False,
                }],
                remappings=[
                    ('image_raw', 'camera/image_raw'),
                    ('camera_info', 'camera/camera_info'),
                    ('image_rect', 'camera/image_rect'),
                ],
                condition=IfCondition(enable_rectification)
            ),

            # Isaac ROS Crop ROI
            ComposableNode(
                package='isaac_ros_image_proc',
                plugin='nvidia::isaac_ros::image_proc::CropRoINode',
                name='crop_roi_node',
                parameters=[{
                    'input_width': input_width,
                    'input_height': input_height,
                    'output_width': 640,
                    'output_height': 480,
                    'crop_width': 640,
                    'crop_height': 480,
                    'offset_x': 640,
                    'offset_y': 360,
                }],
                remappings=[
                    ('image', 'camera/image_rect'),
                    ('camera_info', 'camera/camera_info'),
                    ('image_crop', 'camera/image_crop'),
                    ('camera_info_crop', 'camera/camera_info_crop'),
                ]
            ),

            # Isaac ROS Color Correction
            ComposableNode(
                package='isaac_ros_image_proc',
                plugin='nvidia::isaac_ros::image_proc::BayerAwbNode',
                name='bayer_awb_node',
                parameters=[{
                    'input_width': 640,
                    'input_height': 480,
                }],
                remappings=[
                    ('image_raw', 'camera/image_crop'),
                    ('image_color_corrected', 'camera/image_color_corrected'),
                ]
            ),
        ],
        output='screen'
    )

    return LaunchDescription([
        DeclareLaunchArgument(
            'enable_rectification',
            default_value='True',
            description='Enable image rectification'
        ),
        DeclareLaunchArgument(
            'input_width',
            default_value='1920',
            description='Input image width'
        ),
        DeclareLaunchArgument(
            'input_height',
            default_value='1200',
            description='Input image height'
        ),
        image_pipeline_container,
    ])
```

**Explanation:**
- Creates a composable node container for efficient processing
- Implements image rectification for stereo vision
- Includes ROI cropping for focused processing
- Applies color correction for better perception
- Demonstrates Isaac ROS pipeline composition

## Isaac ROS DNN Inference Example

This example shows how to perform deep neural network inference using Isaac ROS:

```
# Python script for Isaac ROS DNN inference
# File: isaac_ros_dnn_inference.py

#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image
from vision_msgs.msg import Detection2DArray
from std_msgs.msg import Header
import numpy as np
import cv2
from cv_bridge import CvBridge

class IsaacDNNInferenceNode(Node):
    def __init__(self):
        super().__init__('isaac_dnn_inference_node')

        # Initialize CV bridge
        self.bridge = CvBridge()

        # Create subscription to image topic
        self.image_sub = self.create_subscription(
            Image,
            '/camera/image_color_rect',
            self.image_callback,
            10
        )

        # Create publisher for detections
        self.detection_pub = self.create_publisher(
            Detection2DArray,
            '/detections',
            10
        )

        # Mock DNN model (in real application, this would be TensorRT model)
        self.model = self.load_mock_model()

        self.get_logger().info('Isaac DNN Inference Node initialized')

    def load_mock_model(self):
        """Load a mock model for demonstration purposes"""
        # In real Isaac application, this would load a TensorRT optimized model
        self.get_logger().info('Mock DNN model loaded')
        return {'model': 'mock_yolo', 'input_size': (640, 640), 'classes': ['person', 'cup', 'bottle']}

    def image_callback(self, msg):
        """Process incoming image and perform inference"""
        try:
            # Convert ROS Image to OpenCV format
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # Preprocess image for DNN
            processed_image = self.preprocess_image(cv_image)

            # Perform inference (mock implementation)
            detections = self.perform_inference(processed_image)

            # Create and publish detection message
            detection_msg = self.create_detection_message(detections, msg.header)
            self.detection_pub.publish(detection_msg)

            self.get_logger().info(f'Published {len(detections)} detections')

        except Exception as e:
            self.get_logger().error(f'Error processing image: {str(e)}')

    def preprocess_image(self, image):
        """Preprocess image for DNN inference"""
        # Resize image to model input size
        input_height, input_width = 640, 640
        resized_image = cv2.resize(image, (input_width, input_height))

        # Normalize image
        normalized_image = resized_image.astype(np.float32) / 255.0

        return normalized_image

    def perform_inference(self, image):
        """Perform DNN inference (mock implementation)"""
        # In real Isaac application, this would use TensorRT
        # For demonstration, we'll simulate object detection results

        # Simulate detecting a person in the center of the image
        height, width = image.shape[:2]
        detections = [
            {
                'class': 'person',
                'confidence': 0.92,
                'bbox': [width * 0.4, height * 0.3, width * 0.2, height * 0.4]  # x, y, w, h
            },
            {
                'class': 'cup',
                'confidence': 0.87,
                'bbox': [width * 0.6, height * 0.5, width * 0.1, height * 0.15]
            }
        ]

        return detections

    def create_detection_message(self, detections, header):
        """Create Detection2DArray message from detections"""
        detection_array = Detection2DArray()
        detection_array.header = header

        for det in detections:
            detection = Detection2D()
            detection.header = header
            detection.results = []  # In real implementation, this would include classification results

            # Set bounding box (center_x, center_y, width, height)
            bbox = det['bbox']
            detection.bbox.center.x = bbox[0] + bbox[2] / 2  # Convert to center format
            detection.bbox.center.y = bbox[1] + bbox[3] / 2
            detection.bbox.size_x = bbox[2]
            detection.bbox.size_y = bbox[3]

            detection_array.detections.append(detection)

        return detection_array

def main(args=None):
    rclpy.init(args=args)
    node = IsaacDNNInferenceNode()

    try:
        rclpy.spin(node)
    except KeyboardInterrupt:
        node.get_logger().info('Shutting down Isaac DNN Inference Node...')
    finally:
        node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Explanation:**
- Implements DNN inference pipeline using Isaac patterns
- Subscribes to camera image topic
- Performs preprocessing and inference
- Publishes detections in standard format
- Demonstrates Isaac's approach to AI integration

## Isaac Perception Pipeline Example

This example shows a complete perception pipeline using Isaac:

```
# Isaac Perception Pipeline
# File: perception_pipeline.py

#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, CameraInfo, PointCloud2
from geometry_msgs.msg import PointStamped
from std_msgs.msg import String
import numpy as np
import cv2
from cv_bridge import CvBridge

class IsaacPerceptionPipeline(Node):
    def __init__(self):
        super().__init__('isaac_perception_pipeline')

        # Initialize CV bridge
        self.bridge = CvBridge()

        # Create subscriptions
        self.image_sub = self.create_subscription(
            Image, '/camera/image_raw', self.image_callback, 10)
        self.camera_info_sub = self.create_subscription(
            CameraInfo, '/camera/camera_info', self.camera_info_callback, 10)

        # Create publishers
        self.segmentation_pub = self.create_publisher(
            Image, '/camera/segmentation', 10)
        self.object_pose_pub = self.create_publisher(
            PointStamped, '/object_pose', 10)
        self.scene_description_pub = self.create_publisher(
            String, '/scene_description', 10)

        # Camera parameters storage
        self.camera_info = None
        self.intrinsic_matrix = None

        # Perception components
        self.object_detector = self.initialize_object_detector()
        self.segmentation_model = self.initialize_segmentation_model()

        self.get_logger().info('Isaac Perception Pipeline initialized')

    def initialize_object_detector(self):
        """Initialize object detection model"""
        # In real Isaac application, this would load TensorRT optimized model
        self.get_logger().info('Object detector initialized')
        return {'model': 'tensorrt_yolo', 'confidence_threshold': 0.5}

    def initialize_segmentation_model(self):
        """Initialize segmentation model"""
        # In real Isaac application, this would load TensorRT optimized model
        self.get_logger().info('Segmentation model initialized')
        return {'model': 'tensorrt_segmentation', 'classes': ['background', 'object']}

    def camera_info_callback(self, msg):
        """Process camera calibration information"""
        self.camera_info = msg
        self.intrinsic_matrix = np.array(msg.k).reshape(3, 3)

    def image_callback(self, msg):
        """Process incoming image through perception pipeline"""
        try:
            # Convert ROS Image to OpenCV format
            cv_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

            # 1. Object Detection
            detections = self.detect_objects(cv_image)

            # 2. Semantic Segmentation
            segmentation_mask = self.perform_segmentation(cv_image)

            # 3. 3D Pose Estimation (if camera info available)
            object_poses = self.estimate_poses(detections, segmentation_mask)

            # 4. Scene Description
            scene_description = self.describe_scene(detections, segmentation_mask)

            # Publish results
            self.publish_segmentation(segmentation_mask, msg.header)
            self.publish_object_poses(object_poses, msg.header)
            self.publish_scene_description(scene_description, msg.header)

            self.get_logger().info(f'Processed perception pipeline: {len(detections)} objects detected')

        except Exception as e:
            self.get_logger().error(f'Error in perception pipeline: {str(e)}')

    def detect_objects(self, image):
        """Detect objects in the image"""
        # Mock implementation - in real Isaac, this would use TensorRT model
        height, width = image.shape[:2]

        # Simulate detecting objects
        detections = [
            {
                'class': 'person',
                'confidence': 0.95,
                'bbox': [width * 0.3, height * 0.2, width * 0.4, height * 0.6],  # x, y, w, h
                'center': [width * 0.5, height * 0.5]
            },
            {
                'class': 'cup',
                'confidence': 0.89,
                'bbox': [width * 0.7, height * 0.4, width * 0.15, height * 0.2],
                'center': [width * 0.775, height * 0.5]
            }
        ]

        return detections

    def perform_segmentation(self, image):
        """Perform semantic segmentation"""
        # Mock implementation - in real Isaac, this would use TensorRT model
        height, width = image.shape[:2]

        # Create mock segmentation mask
        mask = np.zeros((height, width), dtype=np.uint8)

        # Simulate segmentation results
        for det in self.detect_objects(image):
            x, y, w, h = det['bbox']
            x, y, w, h = int(x), int(y), int(w), int(h)

            if det['class'] == 'person':
                mask[y:y+h, x:x+w] = 1  # Person class
            elif det['class'] == 'cup':
                mask[y:y+h, x:x+w] = 2  # Cup class

        return mask

    def estimate_poses(self, detections, segmentation_mask):
        """Estimate 3D poses of detected objects"""
        poses = []

        for det in detections:
            # In real application, this would use depth information
            # For mock implementation, we'll create placeholder poses
            pose = {
                'class': det['class'],
                'position': [det['center'][0], det['center'][1], 1.0],  # x, y, z
                'confidence': det['confidence']
            }
            poses.append(pose)

        return poses

    def describe_scene(self, detections, segmentation_mask):
        """Create natural language description of the scene"""
        description = f"Scene contains {len(detections)} objects: "
        objects = []

        for det in detections:
            objects.append(f"{det['class']} (confidence: {det['confidence']:.2f})")

        description += ", ".join(objects)
        return description

    def publish_segmentation(self, mask, header):
        """Publish segmentation result as image"""
        # Convert mask to image format
        mask_image = self.bridge.cv2_to_imgmsg(mask, encoding='mono8')
        mask_image.header = header
        self.segmentation_pub.publish(mask_image)

    def publish_object_poses(self, poses, header):
        """Publish object poses"""
        for pose in poses:
            point_msg = PointStamped()
            point_msg.header = header
            point_msg.point.x = pose['position'][0]
            point_msg.point.y = pose['position'][1]
            point_msg.point.z = pose['position'][2]

            self.object_pose_pub.publish(point_msg)

    def publish_scene_description(self, description, header):
        """Publish scene description"""
        desc_msg = String()
        desc_msg.data = description
        self.scene_description_pub.publish(desc_msg)

def main(args=None):
    rclpy.init(args=args)
    pipeline = IsaacPerceptionPipeline()

    try:
        rclpy.spin(pipeline)
    except KeyboardInterrupt:
        pipeline.get_logger().info('Shutting down Isaac Perception Pipeline...')
    finally:
        pipeline.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Explanation:**
- Complete perception pipeline with multiple AI components
- Object detection, segmentation, and pose estimation
- Scene description generation
- Demonstrates Isaac's integrated AI approach

## Isaac Navigation Example

This example shows how to implement AI-powered navigation using Isaac:

```
# Isaac Navigation Example
# File: isaac_navigation.py

#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist, PoseStamped, Point
from sensor_msgs.msg import LaserScan, Image
from nav_msgs.msg import OccupancyGrid, Path
from std_msgs.msg import String
import numpy as np
import math

class IsaacNavigationNode(Node):
    def __init__(self):
        super().__init__('isaac_navigation_node')

        # Create subscriptions
        self.laser_sub = self.create_subscription(
            LaserScan, '/scan', self.laser_callback, 10)
        self.goal_sub = self.create_subscription(
            PoseStamped, '/move_base_simple/goal', self.goal_callback, 10)

        # Create publishers
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.path_pub = self.create_publisher(Path, '/plan', 10)
        self.status_pub = self.create_publisher(String, '/navigation_status', 10)

        # Navigation state
        self.current_goal = None
        self.current_pose = None
        self.laser_data = None
        self.path = []
        self.is_navigating = False

        # AI navigation parameters
        self.safety_distance = 0.5  # meters
        self.linear_speed = 0.3     # m/s
        self.angular_speed = 0.5    # rad/s

        self.get_logger().info('Isaac Navigation Node initialized')

    def laser_callback(self, msg):
        """Process laser scan data"""
        self.laser_data = msg

        if self.is_navigating and self.current_goal:
            self.execute_navigation()

    def goal_callback(self, msg):
        """Receive navigation goal"""
        self.current_goal = msg.pose
        self.is_navigating = True

        # Plan path to goal (simplified)
        self.plan_path_to_goal()

        self.get_logger().info(f'New navigation goal received: ({msg.pose.position.x:.2f}, {msg.pose.position.y:.2f})')

    def plan_path_to_goal(self):
        """Plan path to goal (simplified implementation)"""
        if not self.current_goal:
            return

        # In real Isaac application, this would use sophisticated path planning
        # For mock implementation, we'll create a direct path
        self.path = [self.current_goal.position]  # Direct path for demo

        # Publish path
        path_msg = Path()
        path_msg.header.stamp = self.get_clock().now().to_msg()
        path_msg.header.frame_id = 'map'

        # For demo, publish a direct path point
        pose_stamped = PoseStamped()
        pose_stamped.header = path_msg.header
        pose_stamped.pose.position = self.current_goal.position
        pose_stamped.pose.orientation.w = 1.0

        path_msg.poses.append(pose_stamped)
        self.path_pub.publish(path_msg)

    def execute_navigation(self):
        """Execute navigation using AI-powered decision making"""
        if not self.laser_data or not self.current_goal:
            return

        # Check for obstacles in the path
        safe_to_proceed = self.check_path_safety()

        if not safe_to_proceed:
            # Stop and replan if obstacle detected
            self.stop_robot()
            self.get_logger().info('Obstacle detected, stopping robot')
            return

        # Calculate direction to goal
        goal_direction = self.calculate_direction_to_goal()

        # AI-powered velocity command
        cmd_vel = self.calculate_ai_velocity(goal_direction)

        # Publish command
        self.cmd_vel_pub.publish(cmd_vel)

        # Check if goal reached
        if self.is_goal_reached():
            self.reached_goal()

        self.get_logger().info(f'Navigating: linear={cmd_vel.linear.x:.2f}, angular={cmd_vel.angular.z:.2f}')

    def check_path_safety(self):
        """Check if path is safe using laser data"""
        if not self.laser_data:
            return False

        # Check laser readings in front of robot (simplified)
        front_readings = self.laser_data.ranges[:10] + self.laser_data.ranges[-10:]

        for distance in front_readings:
            if 0 < distance < self.safety_distance:
                return False  # Obstacle too close

        return True

    def calculate_direction_to_goal(self):
        """Calculate direction vector to goal"""
        if not self.current_goal:
            return (0, 0)

        # Simplified - in real application, this would use current pose
        dx = self.current_goal.position.x
        dy = self.current_goal.position.y

        distance = math.sqrt(dx*dx + dy*dy)
        if distance > 0:
            return (dx/distance, dy/distance)
        else:
            return (0, 0)

    def calculate_ai_velocity(self, direction):
        """Calculate AI-powered velocity command"""
        cmd_vel = Twist()

        # Simple AI decision making
        if direction[0] > 0.5:  # Moving forward
            cmd_vel.linear.x = min(self.linear_speed, direction[0] * self.linear_speed)
        else:
            cmd_vel.linear.x = 0.0

        # Angular adjustment based on direction
        cmd_vel.angular.z = direction[1] * self.angular_speed

        return cmd_vel

    def is_goal_reached(self):
        """Check if robot has reached the goal"""
        # Simplified check - in real application, this would use current pose
        if not self.current_goal:
            return False

        # Mock check
        return False  # Simplified for demo

    def reached_goal(self):
        """Handle goal reached event"""
        self.is_navigating = False
        self.stop_robot()

        status_msg = String()
        status_msg.data = 'Goal reached successfully'
        self.status_pub.publish(status_msg)

        self.get_logger().info('Navigation goal reached')

    def stop_robot(self):
        """Stop the robot"""
        cmd_vel = Twist()
        cmd_vel.linear.x = 0.0
        cmd_vel.angular.z = 0.0
        self.cmd_vel_pub.publish(cmd_vel)

def main(args=None):
    rclpy.init(args=args)
    nav_node = IsaacNavigationNode()

    try:
        rclpy.spin(nav_node)
    except KeyboardInterrupt:
        nav_node.get_logger().info('Shutting down Isaac Navigation Node...')
    finally:
        nav_node.stop_robot()
        nav_node.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Explanation:**
- AI-powered navigation with obstacle avoidance
- Laser-based perception for safety
- Goal-driven path planning
- Demonstrates Isaac's approach to autonomous navigation

These examples demonstrate the fundamental patterns used in NVIDIA Isaac applications. Each example shows how to integrate AI with robotic systems using the Isaac platform's hardware acceleration and software frameworks.

## Navigation

- [Previous: AI Concepts for Robotics](./isaac_ai_concepts)
- [Next: Isaac Exercises](./isaac_exercises)
- [Module 3 Home](./index)