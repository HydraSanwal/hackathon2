// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // Create sidebars for each module
  module1Sidebar: [
    {
      type: 'category',
      label: 'Module 1: ROS 2 Robotic Nervous System',
      items: [
        'module1/index',
        'module1/ros2_intro',
        'module1/ros2_architecture',
        'module1/ros2_nodes',
        'module1/ros2_examples',
        'module1/ros2_exercises',
      ],
      link: {
        type: 'doc',
        id: 'module1/index',
      },
    },
  ],
  module2Sidebar: [
    {
      type: 'category',
      label: 'Module 2: Digital Twin (Gazebo & Unity)',
      items: [
        'module2/index',
        'module2/gazebo_basics',
        'module2/unity_integration',
        'module2/digital_twin_theory',
        'module2/digital_twin_examples',
        'module2/digital_twin_exercises',
      ],
      link: {
        type: 'doc',
        id: 'module2/index',
      },
    },
  ],
  module3Sidebar: [
    {
      type: 'category',
      label: 'Module 3: NVIDIA Isaac AI-Robot Brain',
      items: [
        'module3/index',
        'module3/isaac_overview',
        'module3/isaac_architecture',
        'module3/isaac_ai_concepts',
        'module3/isaac_examples',
        'module3/isaac_exercises',
      ],
      link: {
        type: 'doc',
        id: 'module3/index',
      },
    },
  ],
  module4Sidebar: [
    {
      type: 'category',
      label: 'Module 4: Vision-Language-Action (VLA)',
      items: [
        'module4/index',
        'module4/vla_fundamentals',
        'module4/vla_architecture',
        'module4/vla_integration',
        'module4/vla_examples',
        'module4/vla_exercises',
        'module4/capstone_project',
      ],
      link: {
        type: 'doc',
        id: 'module4/index',
      },
    },
  ],
};

module.exports = sidebars;