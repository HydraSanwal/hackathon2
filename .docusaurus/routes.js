import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/docs',
    component: ComponentCreator('/docs', '232'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '24b'),
        routes: [
          {
            path: '/docs/tags',
            component: ComponentCreator('/docs/tags', '0cc'),
            exact: true
          },
          {
            path: '/docs/tags/advanced-robotics',
            component: ComponentCreator('/docs/tags/advanced-robotics', 'd91'),
            exact: true
          },
          {
            path: '/docs/tags/ai',
            component: ComponentCreator('/docs/tags/ai', '91c'),
            exact: true
          },
          {
            path: '/docs/tags/ai-framework',
            component: ComponentCreator('/docs/tags/ai-framework', 'd8b'),
            exact: true
          },
          {
            path: '/docs/tags/ai-robotics',
            component: ComponentCreator('/docs/tags/ai-robotics', '194'),
            exact: true
          },
          {
            path: '/docs/tags/architecture',
            component: ComponentCreator('/docs/tags/architecture', '44b'),
            exact: true
          },
          {
            path: '/docs/tags/capstone',
            component: ComponentCreator('/docs/tags/capstone', 'f83'),
            exact: true
          },
          {
            path: '/docs/tags/code',
            component: ComponentCreator('/docs/tags/code', '0ce'),
            exact: true
          },
          {
            path: '/docs/tags/communication',
            component: ComponentCreator('/docs/tags/communication', '65f'),
            exact: true
          },
          {
            path: '/docs/tags/components',
            component: ComponentCreator('/docs/tags/components', '45d'),
            exact: true
          },
          {
            path: '/docs/tags/computer-vision',
            component: ComponentCreator('/docs/tags/computer-vision', '8c2'),
            exact: true
          },
          {
            path: '/docs/tags/concepts',
            component: ComponentCreator('/docs/tags/concepts', 'd48'),
            exact: true
          },
          {
            path: '/docs/tags/deep-learning',
            component: ComponentCreator('/docs/tags/deep-learning', '991'),
            exact: true
          },
          {
            path: '/docs/tags/design',
            component: ComponentCreator('/docs/tags/design', '43c'),
            exact: true
          },
          {
            path: '/docs/tags/digital-twin',
            component: ComponentCreator('/docs/tags/digital-twin', '586'),
            exact: true
          },
          {
            path: '/docs/tags/examples',
            component: ComponentCreator('/docs/tags/examples', '682'),
            exact: true
          },
          {
            path: '/docs/tags/exercises',
            component: ComponentCreator('/docs/tags/exercises', '61a'),
            exact: true
          },
          {
            path: '/docs/tags/fundamentals',
            component: ComponentCreator('/docs/tags/fundamentals', 'f89'),
            exact: true
          },
          {
            path: '/docs/tags/game-engine',
            component: ComponentCreator('/docs/tags/game-engine', '2cc'),
            exact: true
          },
          {
            path: '/docs/tags/gazebo',
            component: ComponentCreator('/docs/tags/gazebo', '3ce'),
            exact: true
          },
          {
            path: '/docs/tags/implementation',
            component: ComponentCreator('/docs/tags/implementation', '05a'),
            exact: true
          },
          {
            path: '/docs/tags/integration',
            component: ComponentCreator('/docs/tags/integration', 'b38'),
            exact: true
          },
          {
            path: '/docs/tags/introduction',
            component: ComponentCreator('/docs/tags/introduction', 'd23'),
            exact: true
          },
          {
            path: '/docs/tags/machine-learning',
            component: ComponentCreator('/docs/tags/machine-learning', '83a'),
            exact: true
          },
          {
            path: '/docs/tags/modeling',
            component: ComponentCreator('/docs/tags/modeling', '6dc'),
            exact: true
          },
          {
            path: '/docs/tags/multimodal',
            component: ComponentCreator('/docs/tags/multimodal', '1b6'),
            exact: true
          },
          {
            path: '/docs/tags/nodes',
            component: ComponentCreator('/docs/tags/nodes', 'ea0'),
            exact: true
          },
          {
            path: '/docs/tags/nvidia-isaac',
            component: ComponentCreator('/docs/tags/nvidia-isaac', 'f59'),
            exact: true
          },
          {
            path: '/docs/tags/overview',
            component: ComponentCreator('/docs/tags/overview', '5e1'),
            exact: true
          },
          {
            path: '/docs/tags/patterns',
            component: ComponentCreator('/docs/tags/patterns', 'fb8'),
            exact: true
          },
          {
            path: '/docs/tags/physics-engine',
            component: ComponentCreator('/docs/tags/physics-engine', 'fb1'),
            exact: true
          },
          {
            path: '/docs/tags/platform',
            component: ComponentCreator('/docs/tags/platform', 'f96'),
            exact: true
          },
          {
            path: '/docs/tags/practice',
            component: ComponentCreator('/docs/tags/practice', '94a'),
            exact: true
          },
          {
            path: '/docs/tags/problems',
            component: ComponentCreator('/docs/tags/problems', 'a50'),
            exact: true
          },
          {
            path: '/docs/tags/project',
            component: ComponentCreator('/docs/tags/project', 'b80'),
            exact: true
          },
          {
            path: '/docs/tags/robotics',
            component: ComponentCreator('/docs/tags/robotics', '574'),
            exact: true
          },
          {
            path: '/docs/tags/ros-2',
            component: ComponentCreator('/docs/tags/ros-2', '51a'),
            exact: true
          },
          {
            path: '/docs/tags/simulation',
            component: ComponentCreator('/docs/tags/simulation', 'db8'),
            exact: true
          },
          {
            path: '/docs/tags/theory',
            component: ComponentCreator('/docs/tags/theory', 'b84'),
            exact: true
          },
          {
            path: '/docs/tags/unity',
            component: ComponentCreator('/docs/tags/unity', '6a5'),
            exact: true
          },
          {
            path: '/docs/tags/vision-language-action',
            component: ComponentCreator('/docs/tags/vision-language-action', '7dc'),
            exact: true
          },
          {
            path: '/docs/tags/vla',
            component: ComponentCreator('/docs/tags/vla', '766'),
            exact: true
          },
          {
            path: '/docs',
            component: ComponentCreator('/docs', 'cad'),
            routes: [
              {
                path: '/docs/',
                component: ComponentCreator('/docs/', 'b00'),
                exact: true
              },
              {
                path: '/docs/module1/',
                component: ComponentCreator('/docs/module1/', '6de'),
                exact: true,
                sidebar: "module1Sidebar"
              },
              {
                path: '/docs/module1/ros2_architecture',
                component: ComponentCreator('/docs/module1/ros2_architecture', '6d0'),
                exact: true,
                sidebar: "module1Sidebar"
              },
              {
                path: '/docs/module1/ros2_examples',
                component: ComponentCreator('/docs/module1/ros2_examples', '31c'),
                exact: true,
                sidebar: "module1Sidebar"
              },
              {
                path: '/docs/module1/ros2_exercises',
                component: ComponentCreator('/docs/module1/ros2_exercises', 'b7b'),
                exact: true,
                sidebar: "module1Sidebar"
              },
              {
                path: '/docs/module1/ros2_intro',
                component: ComponentCreator('/docs/module1/ros2_intro', '554'),
                exact: true,
                sidebar: "module1Sidebar"
              },
              {
                path: '/docs/module1/ros2_nodes',
                component: ComponentCreator('/docs/module1/ros2_nodes', 'a26'),
                exact: true,
                sidebar: "module1Sidebar"
              },
              {
                path: '/docs/module2/',
                component: ComponentCreator('/docs/module2/', '3dd'),
                exact: true,
                sidebar: "module2Sidebar"
              },
              {
                path: '/docs/module2/digital_twin_examples',
                component: ComponentCreator('/docs/module2/digital_twin_examples', '62f'),
                exact: true,
                sidebar: "module2Sidebar"
              },
              {
                path: '/docs/module2/digital_twin_exercises',
                component: ComponentCreator('/docs/module2/digital_twin_exercises', '813'),
                exact: true,
                sidebar: "module2Sidebar"
              },
              {
                path: '/docs/module2/digital_twin_theory',
                component: ComponentCreator('/docs/module2/digital_twin_theory', '2d4'),
                exact: true,
                sidebar: "module2Sidebar"
              },
              {
                path: '/docs/module2/gazebo_basics',
                component: ComponentCreator('/docs/module2/gazebo_basics', '0a8'),
                exact: true,
                sidebar: "module2Sidebar"
              },
              {
                path: '/docs/module2/unity_integration',
                component: ComponentCreator('/docs/module2/unity_integration', '468'),
                exact: true,
                sidebar: "module2Sidebar"
              },
              {
                path: '/docs/module3/',
                component: ComponentCreator('/docs/module3/', 'cd3'),
                exact: true,
                sidebar: "module3Sidebar"
              },
              {
                path: '/docs/module3/isaac_ai_concepts',
                component: ComponentCreator('/docs/module3/isaac_ai_concepts', '7b8'),
                exact: true,
                sidebar: "module3Sidebar"
              },
              {
                path: '/docs/module3/isaac_architecture',
                component: ComponentCreator('/docs/module3/isaac_architecture', 'd0c'),
                exact: true,
                sidebar: "module3Sidebar"
              },
              {
                path: '/docs/module3/isaac_examples',
                component: ComponentCreator('/docs/module3/isaac_examples', 'd1a'),
                exact: true,
                sidebar: "module3Sidebar"
              },
              {
                path: '/docs/module3/isaac_exercises',
                component: ComponentCreator('/docs/module3/isaac_exercises', '0ef'),
                exact: true,
                sidebar: "module3Sidebar"
              },
              {
                path: '/docs/module3/isaac_overview',
                component: ComponentCreator('/docs/module3/isaac_overview', 'df2'),
                exact: true,
                sidebar: "module3Sidebar"
              },
              {
                path: '/docs/module4/',
                component: ComponentCreator('/docs/module4/', '58f'),
                exact: true,
                sidebar: "module4Sidebar"
              },
              {
                path: '/docs/module4/capstone_project',
                component: ComponentCreator('/docs/module4/capstone_project', '2a5'),
                exact: true,
                sidebar: "module4Sidebar"
              },
              {
                path: '/docs/module4/vla_architecture',
                component: ComponentCreator('/docs/module4/vla_architecture', '968'),
                exact: true,
                sidebar: "module4Sidebar"
              },
              {
                path: '/docs/module4/vla_examples',
                component: ComponentCreator('/docs/module4/vla_examples', '30a'),
                exact: true,
                sidebar: "module4Sidebar"
              },
              {
                path: '/docs/module4/vla_exercises',
                component: ComponentCreator('/docs/module4/vla_exercises', 'cb9'),
                exact: true,
                sidebar: "module4Sidebar"
              },
              {
                path: '/docs/module4/vla_fundamentals',
                component: ComponentCreator('/docs/module4/vla_fundamentals', '77a'),
                exact: true,
                sidebar: "module4Sidebar"
              },
              {
                path: '/docs/module4/vla_integration',
                component: ComponentCreator('/docs/module4/vla_integration', '79f'),
                exact: true,
                sidebar: "module4Sidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'b3b'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
