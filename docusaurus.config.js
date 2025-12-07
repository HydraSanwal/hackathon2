// @ts-check
// `@ts-check` enables ts-checking for the config file
// Note: This cannot be named docusaurus.config.ts because the docusaurus CLI doesn't recognize it

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Physical AI & Humanoid Robotics: From Theory to Action',
  tagline: 'Comprehensive Guide to Physical AI and Humanoid Robotics',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://hackathon-2-test.vercel.app/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For Vercel deployment, use '/' for root, or '/project-name/' for subdirectory
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'your-organization', // Usually your GitHub org/user name.
  projectName: 'physical-ai-humanoid-book', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: false, // Disable blog for this educational book
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Physical AI & Humanoid Robotics',
        logo: {
          alt: 'Physical AI Logo',
          src: 'img/logo.svg',
        },
        hideOnScroll: false,
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'module1Sidebar',
            position: 'left',
            label: 'Module 1: ROS 2',
          },
          {
            type: 'docSidebar',
            sidebarId: 'module2Sidebar',
            position: 'left',
            label: 'Module 2: Digital Twin',
          },
          {
            type: 'docSidebar',
            sidebarId: 'module3Sidebar',
            position: 'left',
            label: 'Module 3: NVIDIA Isaac',
          },
          {
            type: 'docSidebar',
            sidebarId: 'module4Sidebar',
            position: 'left',
            label: 'Module 4: VLA',
          },
          {
            href: 'https://github.com/facebook/docusaurus',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Modules',
            items: [
              {
                label: 'Module 1: ROS 2',
                to: '/docs/module1',
              },
              {
                label: 'Module 2: Digital Twin',
                to: '/docs/module2',
              },
              {
                label: 'Module 3: NVIDIA Isaac',
                to: '/docs/module3',
              },
              {
                label: 'Module 4: Vision-Language-Action',
                to: '/docs/module4',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Stack Overflow',
                href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Physical AI & Humanoid Robotics Book. Built with Docusaurus.`,
      },
      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
      },
    }),
};

module.exports = config;