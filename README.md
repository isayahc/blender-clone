# Blender Clone

A lightweight 3D modeling application inspired by Blender, built with Bun and Three.js.

## Features

- 🎨 **3D Viewport** - Interactive 3D scene with camera controls
- 🔧 **Object Creation** - Add cubes, spheres, cylinders, planes, tori, and cones
- 🎯 **Transform Tools** - Move, rotate, and scale objects
- 📋 **Outliner** - View and manage scene objects
- ⚙️ **Properties Panel** - Edit object transforms in real-time
- ⌨️ **Keyboard Shortcuts** - Blender-style hotkeys (G, R, S)
- 🎭 **Interactive Selection** - Click to select objects in the viewport

## Prerequisites

- [Bun](https://bun.sh) v1.0 or higher

## Installation

```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Clone the repository
git clone https://github.com/isayahc/blender-clone.git
cd blender-clone
```

## Usage

### Development Server

```bash
bun run dev
```

Then open your browser to `http://localhost:3000`

### Keyboard Shortcuts

- **G** - Move/Translate mode
- **R** - Rotate mode
- **S** - Scale mode
- **X** or **Delete** - Delete selected object
- **ESC** - Deselect object

### Mouse Controls

- **Left Click** - Select object
- **Right Click + Drag** - Rotate camera (orbit)
- **Middle Click + Drag** - Pan camera
- **Scroll Wheel** - Zoom in/out

## Project Structure

```
blender-clone/
├── public/
│   ├── index.html      # Main HTML file with UI layout
│   └── app.js          # Three.js application logic
├── src/
│   └── server.ts       # Bun development server
├── package.json
└── README.md
```

## Technology Stack

- **Runtime**: Bun
- **3D Engine**: Three.js (v0.170.0)
- **Language**: JavaScript (ES Modules)

## Features Overview

### UI Layout

- **Header** - Menu bar for file operations
- **Toolbar** - Quick access to object creation tools
- **Viewport** - Main 3D scene canvas
- **Properties Panel** - Object transformation properties
- **Outliner** - Scene hierarchy view
- **Status Bar** - Current operation status

### Object Management

- Add primitive shapes (cube, sphere, cylinder, plane, torus, cone)
- Select objects by clicking in viewport or outliner
- Delete objects with X key or delete button
- Duplicate objects with duplicate button
- Real-time transform property editing

### Transform Controls

- **Translate** - Move objects in 3D space
- **Rotate** - Rotate objects around their center
- **Scale** - Resize objects uniformly or per axis

## License

MIT