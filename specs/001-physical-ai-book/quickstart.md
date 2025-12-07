# Quickstart Guide: Physical AI & Humanoid Robotics Book

## Getting Started

This guide will help you set up and run the Physical AI & Humanoid Robotics book locally on your machine.

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # OR
   yarn install
   ```

3. **Start the development server**:
   ```bash
   npm run start
   # OR
   yarn start
   ```

4. **Open your browser** to `http://localhost:3000` to view the book

### Project Structure Overview

```
docs/
├── module1/          # ROS 2 Robotic Nervous System
│   ├── index.md      # Module introduction
│   ├── *.md          # Module content files
└── ...
src/
├── components/       # Custom React components
├── pages/            # Additional pages
└── css/              # Custom styles
static/               # Static assets
docusaurus.config.js  # Site configuration
```

### Adding New Content

1. **Create a new markdown file** in the appropriate module directory:
   ```bash
   # Example: Adding a new section to Module 1
   touch docs/module1/new-section.md
   ```

2. **Follow the standard frontmatter format**:
   ```markdown
   ---
   title: Title of the Section
   sidebar_position: 3  # Determines position in sidebar
   description: Brief description of the content
   ---

   # Your content here
   ```

3. **Add the file to the sidebar configuration** in `sidebars.js`:
   ```javascript
   module1: [
     'module1/index',
     'module1/new-section',  // Add your file here
   ],
   ```

### Building for Production

To build the static site for deployment:

```bash
npm run build
# OR
yarn build
```

The output will be in the `build/` directory and can be deployed to GitHub Pages or Vercel.

### Deploying

#### GitHub Pages
1. Update the `deployment` section in `docusaurus.config.js` with your repository details
2. Run: `npm run deploy`

#### Vercel
1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Vercel will automatically build and deploy on pushes to main branch

### Content Guidelines

1. **Theory First**: Always explain concepts before showing examples
2. **Beginner-Friendly**: Use simple language and provide context
3. **Static Code Examples**: Include code as text-only snippets with explanations
4. **Exercises**: Include practical exercises with clear objectives and solutions
5. **Cross-Module Consistency**: Maintain consistent terminology across all modules

### Common Commands

```bash
# Start development server
npm run start

# Build for production
npm run build

# Run tests (if any)
npm run test

# Clear cache
npm run clear

# Serve built site locally for testing
npm run serve
```

### Troubleshooting

**Problem**: Site doesn't load or shows errors
**Solution**: Run `npm run clear` and restart the development server

**Problem**: Changes don't appear
**Solution**: Clear browser cache and restart the development server

**Problem**: Build fails
**Solution**: Check for syntax errors in markdown files and ensure all links are valid