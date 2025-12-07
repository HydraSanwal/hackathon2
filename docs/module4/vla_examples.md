---
title: VLA Code Examples
sidebar_position: 5
description: Text-based code examples demonstrating Vision-Language-Action systems
tags: [vla, examples, vision-language-action, code, implementation]
---

# VLA Code Examples

<div class="code-example">
This section provides text-based code examples that demonstrate the practical implementation of Vision-Language-Action (VLA) systems. These examples illustrate how to integrate visual perception, natural language understanding, and robotic action in unified frameworks.
</div>

### How to Use These Examples
These examples show how to implement VLA concepts using Python and ROS 2. Focus on understanding the patterns for multimodal integration rather than memorizing every line of code.

## Basic VLA System Example

This example demonstrates a basic Vision-Language-Action system that can follow simple instructions:

```
# Basic VLA System
# File: basic_vla_system.py

#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, CameraInfo
from geometry_msgs.msg import Pose, Point
from std_msgs.msg import String
from vision_msgs.msg import Detection2DArray
from std_msgs.msg import Float64MultiArray
import numpy as np
import cv2
from cv_bridge import CvBridge
import json

class BasicVLASystem(Node):
    def __init__(self):
        super().__init__('basic_vla_system')

        # Initialize CV bridge
        self.bridge = CvBridge()

        # Create subscriptions
        self.image_sub = self.create_subscription(
            Image, '/camera/image_raw', self.image_callback, 10)
        self.camera_info_sub = self.create_subscription(
            CameraInfo, '/camera/camera_info', self.camera_info_callback, 10)
        self.command_sub = self.create_subscription(
            String, '/vla/command', self.command_callback, 10)
        self.detection_sub = self.create_subscription(
            Detection2DArray, '/camera/detections', self.detection_callback, 10)

        # Create publishers
        self.action_cmd_pub = self.create_publisher(
            Float64MultiArray, '/robot/joint_commands', 10)
        self.status_pub = self.create_publisher(
            String, '/vla/status', 10)

        # System state
        self.current_image = None
        self.camera_info = None
        self.current_detections = None
        self.current_command = None
        self.is_processing = False

        # Object mappings for language grounding
        self.object_mappings = {
            'cup': ['mug', 'glass', 'container'],
            'box': ['container', 'case', 'crate'],
            'book': ['novel', 'textbook', 'magazine'],
            'phone': ['cellphone', 'mobile', 'device']
        }

        # Action mappings
        self.action_mappings = {
            'pick': ['grasp', 'take', 'lift', 'hold'],
            'place': ['put', 'set', 'position', 'move'],
            'move': ['go', 'navigate', 'travel', 'approach'],
            'find': ['locate', 'search', 'identify', 'spot']
        }

        self.get_logger().info('Basic VLA System initialized')

    def image_callback(self, msg):
        """Process incoming camera image"""
        try:
            self.current_image = self.bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')
        except Exception as e:
            self.get_logger().error(f'Error processing image: {str(e)}')

    def camera_info_callback(self, msg):
        """Process camera calibration information"""
        self.camera_info = msg

    def detection_callback(self, msg):
        """Process object detections"""
        self.current_detections = msg.detections

    def command_callback(self, msg):
        """Process language command"""
        command = msg.data.lower().strip()
        self.current_command = command

        if not self.is_processing:
            self.is_processing = True
            self.process_command()
            self.is_processing = False

    def process_command(self):
        """Process the current language command with visual information"""
        if not self.current_command:
            return

        self.get_logger().info(f'Processing command: {self.current_command}')

        # Parse the command
        parsed_command = self.parse_language_command(self.current_command)

        if not parsed_command:
            self.get_logger().warn('Could not parse command')
            return

        # Ground the command in visual information
        action_plan = self.ground_command_in_vision(parsed_command)

        if not action_plan:
            self.get_logger().warn('Could not ground command in vision')
            return

        # Execute the action plan
        self.execute_action_plan(action_plan)

        # Publish status
        status_msg = String()
        status_msg.data = f'Executed: {self.current_command}'
        self.status_pub.publish(status_msg)

    def parse_language_command(self, command):
        """Parse natural language command into structured format"""
        # Simple command parsing (in real VLA, this would use NLP models)
        command_lower = command.lower()

        # Extract action
        action = None
        for action_key, action_synonyms in self.action_mappings.items():
            if any(synonym in command_lower for synonym in [action_key] + action_synonyms):
                action = action_key
                break

        # Extract object
        target_object = None
        for obj_key, obj_synonyms in self.object_mappings.items():
            if any(synonym in command_lower for synonym in [obj_key] + obj_synonyms):
                target_object = obj_key
                break

        # Extract spatial relation (simplified)
        spatial_relation = None
        if 'left' in command_lower:
            spatial_relation = 'left'
        elif 'right' in command_lower:
            spatial_relation = 'right'
        elif 'front' in command_lower or 'in front' in command_lower:
            spatial_relation = 'front'
        elif 'behind' in command_lower:
            spatial_relation = 'behind'

        parsed = {
            'action': action,
            'target_object': target_object,
            'spatial_relation': spatial_relation,
            'original_command': command
        }

        self.get_logger().info(f'Parsed command: {parsed}')
        return parsed

    def ground_command_in_vision(self, parsed_command):
        """Ground the parsed command in visual information"""
        if not self.current_detections or not self.current_image:
            self.get_logger().warn('No visual information available for grounding')
            return None

        action = parsed_command['action']
        target_object = parsed_command['target_object']
        spatial_relation = parsed_command['spatial_relation']

        # Find target object in detections
        target_detection = None
        for detection in self.current_detections:
            # This is a simplified approach - real VLA would use better matching
            if target_object and target_object in detection.results[0].hypothesis.class_id.lower():
                target_detection = detection
                break

        if not target_detection and target_object:
            self.get_logger().warn(f'Target object "{target_object}" not found in current scene')
            return None

        # Create action plan
        action_plan = {
            'action': action,
            'target_object': target_object,
            'target_pose': self.detection_to_pose(target_detection) if target_detection else None,
            'spatial_relation': spatial_relation,
            'plan_confidence': 0.8  # Mock confidence
        }

        self.get_logger().info(f'Grounded action plan: {action_plan}')
        return action_plan

    def detection_to_pose(self, detection):
        """Convert detection to 3D pose (simplified)"""
        # In real application, this would use depth information and camera calibration
        # For this example, we'll return a mock pose
        center_x = detection.bbox.center.x
        center_y = detection.bbox.center.y
        width = detection.bbox.size_x
        height = detection.bbox.size_y

        # Mock 3D position (in real application, use depth and calibration)
        pose = Pose()
        pose.position.x = center_x / 100.0  # Normalize to reasonable scale
        pose.position.y = center_y / 100.0
        pose.position.z = 0.5  # Assume 50cm height
        pose.orientation.w = 1.0

        return pose

    def execute_action_plan(self, action_plan):
        """Execute the planned action"""
        action = action_plan['action']
        target_pose = action_plan['target_pose']
        target_object = action_plan['target_object']

        if not action:
            self.get_logger().warn('No action to execute')
            return

        self.get_logger().info(f'Executing action: {action} on {target_object}')

        # Generate robot commands based on action plan
        if action == 'pick' and target_pose:
            # Plan trajectory to grasp the object
            joint_commands = self.plan_grasp_trajectory(target_pose)
            self.publish_joint_commands(joint_commands)

        elif action == 'place' and target_pose:
            # Plan trajectory to place at location
            joint_commands = self.plan_placement_trajectory(target_pose)
            self.publish_joint_commands(joint_commands)

        elif action == 'move' and target_pose:
            # Plan navigation trajectory
            joint_commands = self.plan_navigation_trajectory(target_pose)
            self.publish_joint_commands(joint_commands)

        else:
            # For other actions, publish a default command
            joint_commands = Float64MultiArray()
            joint_commands.data = [0.0] * 6  # Default joint positions
            self.publish_joint_commands(joint_commands)

    def plan_grasp_trajectory(self, target_pose):
        """Plan trajectory for grasping an object"""
        # Mock trajectory planning (in real application, use motion planning)
        commands = Float64MultiArray()

        # Example: move to position above object, then descend
        joint_positions = [
            target_pose.position.x + 0.1,  # Approach X
            target_pose.position.y,        # Approach Y
            target_pose.position.z + 0.2,  # Approach Z (above object)
            0.0, 0.0, 0.0  # Mock joint angles
        ]

        commands.data = joint_positions
        return commands

    def plan_placement_trajectory(self, target_pose):
        """Plan trajectory for placing an object"""
        # Mock trajectory planning
        commands = Float64MultiArray()

        # Example: move to target location
        joint_positions = [
            target_pose.position.x,
            target_pose.position.y,
            target_pose.position.z,
            0.0, 0.0, 0.0
        ]

        commands.data = joint_positions
        return commands

    def plan_navigation_trajectory(self, target_pose):
        """Plan navigation trajectory"""
        # Mock navigation planning
        commands = Float64MultiArray()

        # Example: move toward target
        joint_positions = [
            target_pose.position.x * 0.7,  # Scale for navigation
            target_pose.position.y * 0.7,
            target_pose.position.z,
            0.0, 0.0, 0.0
        ]

        commands.data = joint_positions
        return commands

    def publish_joint_commands(self, commands):
        """Publish joint commands to robot"""
        self.action_cmd_pub.publish(commands)
        self.get_logger().info('Published joint commands to robot')

def main(args=None):
    rclpy.init(args=args)
    vla_system = BasicVLASystem()

    try:
        rclpy.spin(vla_system)
    except KeyboardInterrupt:
        vla_system.get_logger().info('Shutting down Basic VLA System...')
    finally:
        vla_system.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Explanation:**
- Basic VLA system that processes language commands and visual information
- Language parsing with action and object recognition
- Visual grounding of language concepts
- Action planning and execution
- Demonstrates fundamental VLA integration principles

## Cross-Modal Attention Example

This example shows how to implement cross-modal attention for better vision-language integration:

```
# Cross-Modal Attention Implementation
# File: cross_modal_attention.py

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np

class CrossModalAttention(nn.Module):
    def __init__(self, feature_dim):
        super(CrossModalAttention, self).__init__()

        self.feature_dim = feature_dim

        # Linear projections for query, key, value
        self.vision_query = nn.Linear(feature_dim, feature_dim)
        self.vision_key = nn.Linear(feature_dim, feature_dim)
        self.vision_value = nn.Linear(feature_dim, feature_dim)

        self.lang_query = nn.Linear(feature_dim, feature_dim)
        self.lang_key = nn.Linear(feature_dim, feature_dim)
        self.lang_value = nn.Linear(feature_dim, feature_dim)

        # Self-attention for each modality
        self.vision_self_attn = nn.MultiheadAttention(feature_dim, num_heads=8)
        self.lang_self_attn = nn.MultiheadAttention(feature_dim, num_heads=8)

        # Cross-attention between modalities
        self.vision_lang_cross_attn = nn.MultiheadAttention(feature_dim, num_heads=8)
        self.lang_vision_cross_attn = nn.MultiheadAttention(feature_dim, num_heads=8)

        # Layer normalization
        self.norm_vision = nn.LayerNorm(feature_dim)
        self.norm_lang = nn.LayerNorm(feature_dim)

        # Feed-forward networks
        self.ffn_vision = nn.Sequential(
            nn.Linear(feature_dim, feature_dim * 4),
            nn.ReLU(),
            nn.Linear(feature_dim * 4, feature_dim)
        )
        self.ffn_lang = nn.Sequential(
            nn.Linear(feature_dim, feature_dim * 4),
            nn.ReLU(),
            nn.Linear(feature_dim * 4, feature_dim)
        )

    def forward(self, vision_features, lang_features):
        """
        vision_features: [batch_size, num_regions, feature_dim]
        lang_features: [batch_size, seq_len, feature_dim]
        """

        batch_size, num_regions, _ = vision_features.shape
        seq_len = lang_features.shape[1]

        # Self-attention within each modality
        vision_self, _ = self.vision_self_attn(
            vision_features.transpose(0, 1),
            vision_features.transpose(0, 1),
            vision_features.transpose(0, 1)
        )
        vision_self = vision_self.transpose(0, 1)
        vision_features = self.norm_vision(vision_features + vision_self)

        lang_self, _ = self.lang_self_attn(
            lang_features.transpose(0, 1),
            lang_features.transpose(0, 1),
            lang_features.transpose(0, 1)
        )
        lang_self = lang_self.transpose(0, 1)
        lang_features = self.norm_lang(lang_features + lang_self)

        # Cross-attention: vision attends to language
        vision_lang_attn, _ = self.vision_lang_cross_attn(
            vision_features.transpose(0, 1),  # query
            lang_features.transpose(0, 1),    # key
            lang_features.transpose(0, 1)     # value
        )
        vision_lang_attn = vision_lang_attn.transpose(0, 1)
        vision_features = self.norm_vision(vision_features + vision_lang_attn)

        # Cross-attention: language attends to vision
        lang_vision_attn, _ = self.lang_vision_cross_attn(
            lang_features.transpose(0, 1),    # query
            vision_features.transpose(0, 1),  # key
            vision_features.transpose(0, 1)   # value
        )
        lang_vision_attn = lang_vision_attn.transpose(0, 1)
        lang_features = self.norm_lang(lang_features + lang_vision_attn)

        # Feed-forward networks
        vision_ffn = self.ffn_vision(vision_features)
        vision_features = self.norm_vision(vision_features + vision_ffn)

        lang_ffn = self.ffn_lang(lang_features)
        lang_features = self.norm_lang(lang_features + lang_ffn)

        return vision_features, lang_features

class VLAFusionNetwork(nn.Module):
    def __init__(self, vision_dim=512, lang_dim=512, joint_dim=1024):
        super(VLAFusionNetwork, self).__init__()

        self.vision_dim = vision_dim
        self.lang_dim = lang_dim
        self.joint_dim = joint_dim

        # Cross-modal attention module
        self.cross_attention = CrossModalAttention(max(vision_dim, lang_dim))

        # Project dimensions to match if needed
        if vision_dim != lang_dim:
            self.vision_proj = nn.Linear(vision_dim, max(vision_dim, lang_dim))
            self.lang_proj = nn.Linear(lang_dim, max(vision_dim, lang_dim))
        else:
            self.vision_proj = nn.Identity()
            self.lang_proj = nn.Identity()

        # Fusion layer
        self.fusion_layer = nn.Sequential(
            nn.Linear(max(vision_dim, lang_dim) * 2, joint_dim),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(joint_dim, joint_dim)
        )

        # Action prediction head
        self.action_head = nn.Sequential(
            nn.Linear(joint_dim, 512),
            nn.ReLU(),
            nn.Linear(512, 256),  # Number of possible actions
        )

    def forward(self, vision_features, lang_features):
        """
        vision_features: [batch_size, num_regions, vision_dim]
        lang_features: [batch_size, seq_len, lang_dim]
        """

        # Project features to same dimension if needed
        vision_proj = self.vision_proj(vision_features)
        lang_proj = self.lang_proj(lang_features)

        # Apply cross-modal attention
        attended_vision, attended_lang = self.cross_attention(vision_proj, lang_proj)

        # Global average pooling to get single representation
        vision_pooled = torch.mean(attended_vision, dim=1)  # [batch_size, dim]
        lang_pooled = torch.mean(attended_lang, dim=1)      # [batch_size, dim]

        # Concatenate and fuse
        joint_features = torch.cat([vision_pooled, lang_pooled], dim=-1)  # [batch_size, 2*dim]

        # Apply fusion
        fused_features = self.fusion_layer(joint_features)  # [batch_size, joint_dim]

        # Predict actions
        action_logits = self.action_head(fused_features)    # [batch_size, num_actions]

        return action_logits, fused_features

# Example usage
def example_usage():
    # Create a batch of dummy data
    batch_size = 4
    num_vision_regions = 10
    vision_dim = 512
    lang_seq_len = 20
    lang_dim = 512

    vision_features = torch.randn(batch_size, num_vision_regions, vision_dim)
    lang_features = torch.randn(batch_size, lang_seq_len, lang_dim)

    # Create and run the VLA fusion network
    vla_net = VLAFusionNetwork(vision_dim=vision_dim, lang_dim=lang_dim)

    action_logits, fused_features = vla_net(vision_features, lang_features)

    print(f"Action logits shape: {action_logits.shape}")
    print(f"Fused features shape: {fused_features.shape}")

    return action_logits, fused_features

if __name__ == "__main__":
    example_usage()
```

**Explanation:**
- Implements cross-modal attention for vision-language integration
- Allows each modality to attend to the other
- Creates joint representation for action prediction
- Demonstrates neural architecture for VLA fusion

## Hierarchical VLA System Example

This example shows a hierarchical VLA system with multiple levels of abstraction:

```
# Hierarchical VLA System
# File: hierarchical_vla.py

#!/usr/bin/env python3

import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, PointCloud2
from geometry_msgs.msg import Pose, Twist
from std_msgs.msg import String, Bool
from action_msgs.msg import GoalStatus
from std_msgs.msg import Float64MultiArray
import numpy as np
import cv2
from cv_bridge import CvBridge
import threading
import time

class HighLevelPlanner(Node):
    """High-level task planner for VLA system"""
    def __init__(self, node_name='high_level_planner'):
        super().__init__(node_name)

        # Communication with mid-level planner
        self.task_sub = self.create_subscription(String, '/vla/task', self.task_callback, 10)
        self.task_pub = self.create_publisher(String, '/vla/subtask', 10)
        self.status_pub = self.create_publisher(String, '/vla/high_level_status', 10)

        self.current_task = None
        self.task_decomposition = []

        # Task decomposition rules
        self.task_rules = {
            'set_table': ['find_dishes', 'grasp_dish', 'place_dish'],
            'clean_room': ['find_objects', 'grasp_object', 'place_in_bin'],
            'assemble_item': ['find_parts', 'grasp_part', 'place_part', 'align_part'],
            'serve_drink': ['find_cup', 'grasp_cup', 'navigate_to_kitchen', 'fill_cup', 'deliver_cup']
        }

    def task_callback(self, msg):
        """Receive high-level task and decompose into subtasks"""
        self.current_task = msg.data.lower()
        self.get_logger().info(f'Received high-level task: {self.current_task}')

        # Decompose task into subtasks
        subtasks = self.decompose_task(self.current_task)

        # Publish subtasks sequentially
        for subtask in subtasks:
            subtask_msg = String()
            subtask_msg.data = subtask
            self.task_pub.publish(subtask_msg)
            self.get_logger().info(f'Published subtask: {subtask}')

            # Wait for subtask completion before proceeding
            time.sleep(2)  # In real system, wait for confirmation

    def decompose_task(self, task):
        """Decompose high-level task into subtasks"""
        if task in self.task_rules:
            return self.task_rules[task]
        else:
            # Default decomposition for unknown tasks
            return ['find_object', 'grasp_object', 'navigate', 'place_object']

class MidLevelPlanner(Node):
    """Mid-level action planner for VLA system"""
    def __init__(self, node_name='mid_level_planner'):
        super().__init__(node_name)

        # Communication with high and low levels
        self.subtask_sub = self.create_subscription(String, '/vla/subtask', self.subtask_callback, 10)
        self.action_pub = self.create_publisher(Float64MultiArray, '/vla/action_primitive', 10)
        self.status_pub = self.create_publisher(String, '/vla/mid_level_status', 10)

        self.current_subtask = None
        self.perception_sub = self.create_subscription(
            String, '/vla/perception_update', self.perception_callback, 10)

        self.current_objects = {}
        self.current_pose = None

    def subtask_callback(self, msg):
        """Process subtask and plan action primitives"""
        self.current_subtask = msg.data.lower()
        self.get_logger().info(f'Processing subtask: {self.current_subtask}')

        # Plan action based on subtask
        action_primitive = self.plan_action_primitive(self.current_subtask)

        if action_primitive:
            self.action_pub.publish(action_primitive)
            self.get_logger().info(f'Published action primitive for: {self.current_subtask}')

    def perception_callback(self, msg):
        """Update perception information"""
        try:
            perception_data = json.loads(msg.data)
            self.current_objects = perception_data.get('objects', {})
            self.current_pose = perception_data.get('robot_pose', None)
        except:
            pass  # Ignore malformed perception data

    def plan_action_primitive(self, subtask):
        """Plan action primitive for subtask"""
        primitive = Float64MultiArray()

        if 'find' in subtask:
            # Action primitive for finding objects
            primitive.data = [1.0, 0.0, 0.0, 0.0, 0.0, 0.0]  # Example: search action

        elif 'grasp' in subtask:
            # Action primitive for grasping
            if self.current_objects:
                # Find target object
                target_obj = self.find_target_object(subtask)
                if target_obj:
                    primitive.data = [0.0, 1.0, 0.0, target_obj['x'], target_obj['y'], target_obj['z']]
                else:
                    primitive.data = [0.0, 1.0, 0.0, 0.0, 0.0, 0.0]  # Default grasp

        elif 'navigate' in subtask:
            # Action primitive for navigation
            primitive.data = [0.0, 0.0, 1.0, 1.0, 0.0, 0.0]  # Example: go forward

        elif 'place' in subtask or 'align' in subtask:
            # Action primitive for placement/alignment
            primitive.data = [0.0, 0.0, 0.0, 1.0, 1.0, 0.0]

        else:
            # Default action
            primitive.data = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

        return primitive

    def find_target_object(self, subtask):
        """Find target object based on subtask description"""
        # Simple object matching (in real system, use better matching)
        for obj_name, obj_data in self.current_objects.items():
            if obj_name in subtask or any(keyword in subtask for keyword in [obj_name]):
                return obj_data
        return None

class LowLevelController(Node):
    """Low-level robot controller for VLA system"""
    def __init__(self, node_name='low_level_controller'):
        super().__init__(node_name)

        # Receive action primitives
        self.action_sub = self.create_subscription(
            Float64MultiArray, '/vla/action_primitive', self.action_callback, 10)
        self.joint_pub = self.create_publisher(Float64MultiArray, '/joint_group_position_controller/commands', 10)
        self.cmd_vel_pub = self.create_publisher(Twist, '/cmd_vel', 10)
        self.status_pub = self.create_publisher(String, '/vla/low_level_status', 10)

        # Robot state
        self.current_joints = [0.0] * 6
        self.safety_enabled = True

    def action_callback(self, msg):
        """Execute low-level action based on primitive"""
        action_data = list(msg.data)

        self.get_logger().info(f'Executing low-level action: {action_data}')

        # Interpret action primitive
        if len(action_data) >= 6:
            action_type = action_data[0]
            params = action_data[1:]

            if action_type == 1.0:  # Search action
                self.execute_search(params)
            elif action_type == 0.0 and action_data[1] == 1.0:  # Grasp action
                self.execute_grasp(params)
            elif action_type == 0.0 and action_data[2] == 1.0:  # Navigate action
                self.execute_navigation(params)
            elif action_type == 0.0 and action_data[3] == 1.0:  # Place/align action
                self.execute_placement(params)

        # Publish status
        status_msg = String()
        status_msg.data = f'Executed action: {action_data}'
        self.status_pub.publish(status_msg)

    def execute_search(self, params):
        """Execute search behavior"""
        # Example: Rotate robot to look around
        cmd_vel = Twist()
        cmd_vel.angular.z = 0.5  # Rotate slowly
        self.cmd_vel_pub.publish(cmd_vel)
        self.get_logger().info('Executing search behavior')

    def execute_grasp(self, params):
        """Execute grasp motion"""
        if len(params) >= 3:
            target_x, target_y, target_z = params[0], params[1], params[2]

            # Calculate joint positions for grasp (simplified)
            joint_cmd = Float64MultiArray()
            joint_cmd.data = [target_x, target_y, target_z, 0.0, 0.0, 0.0]  # Simplified
            self.joint_pub.publish(joint_cmd)
            self.get_logger().info(f'Executing grasp at: ({target_x}, {target_y}, {target_z})')

    def execute_navigation(self, params):
        """Execute navigation command"""
        cmd_vel = Twist()
        cmd_vel.linear.x = params[0] if len(params) > 0 else 0.5
        cmd_vel.angular.z = params[1] if len(params) > 1 else 0.0
        self.cmd_vel_pub.publish(cmd_vel)
        self.get_logger().info('Executing navigation')

    def execute_placement(self, params):
        """Execute placement motion"""
        if len(params) >= 3:
            target_x, target_y, target_z = params[0], params[1], params[2]

            joint_cmd = Float64MultiArray()
            joint_cmd.data = [target_x, target_y, target_z, 0.5, 0.5, 0.5]  # Different pose
            self.joint_pub.publish(joint_cmd)
            self.get_logger().info(f'Executing placement at: ({target_x}, {target_y}, {target_z})')

class HierarchicalVLAManager(Node):
    """Manages the hierarchical VLA system"""
    def __init__(self):
        super().__init__('hierarchical_vla_manager')

        # Create planner instances
        self.high_level = HighLevelPlanner()
        self.mid_level = MidLevelPlanner()
        self.low_level = LowLevelController()

        # Task publisher for the system
        self.task_pub = self.create_publisher(String, '/vla/task', 10)

        self.get_logger().info('Hierarchical VLA System initialized')

    def run_demo(self):
        """Run a demonstration of the hierarchical system"""
        # Publish a sample task
        demo_task = String()
        demo_task.data = 'set_table'

        self.get_logger().info('Starting hierarchical VLA demo: set_table')
        self.task_pub.publish(demo_task)

def main(args=None):
    rclpy.init(args=args)

    # Create the hierarchical system manager
    manager = HierarchicalVLAManager()

    # Run the demo
    manager.run_demo()

    try:
        # Spin all nodes
        executor = rclpy.executors.MultiThreadedExecutor()
        executor.add_node(manager.high_level)
        executor.add_node(manager.mid_level)
        executor.add_node(manager.low_level)
        executor.add_node(manager)

        executor.spin()
    except KeyboardInterrupt:
        manager.get_logger().info('Shutting down Hierarchical VLA System...')
    finally:
        manager.destroy_node()
        rclpy.shutdown()

if __name__ == '__main__':
    main()
```

**Explanation:**
- Implements hierarchical VLA with three levels of abstraction
- High-level planner: task decomposition and sequencing
- Mid-level planner: action planning and object grounding
- Low-level controller: execution of primitive actions
- Demonstrates structured approach to complex VLA tasks

## Navigation

- [Previous: VLA Integration Patterns](./vla_integration)
- [Next: VLA Exercises](./vla_exercises)
- [Module 4 Home](./index)