# ⚛️ Positron - Cyberpunk Presentation Design Studio

A powerful, modern presentation design editor built with Next.js, featuring stunning cyberpunk aesthetics, real-time collaboration, and advanced design tools.

![Positron Banner](https://img.shields.io/badge/Positron-Design%20Studio-ff69b4?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

### 🎨 Design Tools
- **Rich Text Editor** with custom fonts, styles, and 3D text effects
- **Shape Library** with glassmorphism effects and corner radius controls
- **Image Handling** with filters, 3D effects, and advanced compression
- **Video & Audio** support with custom controls
- **Drawing Canvas** for freehand illustrations

### 🚀 Advanced Features
- **Real-time Collaboration** via Supabase
- **Cloud Storage** for presentations
- **Share & Present** with public links
- **Export Options**: PDF, PNG, JPG, HTML, JSON
- **Template Library** with pre-designed slides
- **Custom Fonts** upload support
- **Keyboard Shortcuts** for power users

### 🎭 Cyberpunk UI
- **Neon Glow Effects** with animated accents
- **Glassmorphism** panels and backgrounds
- **Animated Scanlines** and holographic effects
- **Custom Scrollbars** with gradient themes
- **Responsive Design** with mobile support

### 🎬 Animations & Transitions
- **Element Animations**: Fade, Slide, Zoom, Bounce, Flip, Rotate
- **Slide Transitions**: Cube, Carousel, Fold, Reveal, Room
- **3D Effects** for text and images
- **Preview Mode** for testing animations

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Export**: jsPDF, html2canvas
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for cloud features)

### Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/PNBFor/the_positron_project.git
cd the_positron_project
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

4. **Set up Supabase database**

Run the SQL scripts in the `scripts` folder to create the necessary tables:
- `create-presentations-table.sql`
- `update-presentations-table-v2.sql`

5. **Run the development server**
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

6. **Open in browser**
\`\`\`
http://localhost:3000
\`\`\`

## 📖 Usage

### Creating a Presentation

1. Click on the canvas to start designing
2. Use the left panel to add/manage slides
3. Use the right panel to add elements (text, shapes, images, video)
4. Customize elements with the properties panel
5. Add animations and transitions
6. Save to cloud or export

### Keyboard Shortcuts

- `Ctrl/Cmd + S` - Save presentation
- `F5` - Start presentation mode
- `G` - Toggle grid
- `Delete/Backspace` - Delete selected element
- `Ctrl/Cmd + D` - Duplicate selected element
- `?` - Show keyboard shortcuts
- `Arrow Keys` - Move selected element

### Exporting

- **PDF** - Single file with all slides
- **PNG/JPG** - Individual images for each slide
- **HTML** - Standalone HTML presentation
- **JSON** - Project file for backup/sharing

## 🎨 Customization

### Adding Custom Fonts

1. Click on a text element
2. Open the font dropdown
3. Click "Upload Custom Font"
4. Select a `.ttf`, `.otf`, `.woff`, or `.woff2` file

### Creating Templates

Templates are stored in `components/template-library.tsx`. You can add new templates by following the existing structure.

### Modifying UI Theme

The cyberpunk theme is defined in `app/globals.css`. You can customize:
- Color variables (--cyber-pink, --cyber-cyan, etc.)
- Animation keyframes
- Glassmorphism effects
- Neon glow effects

## 🔧 Configuration

### Image Compression

Image compression presets are configured in `components/image-uploader.tsx`:
- High Quality
- Balanced
- Presentation
- Web Optimized
- Small Size
- Mobile
- Thumbnail
- Custom

### Slide Transitions

Available transitions in `components/animation-controls.tsx`:
- None
- Fade
- Slide
- Zoom
- Flip
- Cube
- Carousel
- Fold
- Reveal
- Room

## 📦 Build for Production

\`\`\`bash
npm run build
npm start
# or
yarn build
yarn start
\`\`\`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Supabase](https://supabase.com/) - Backend as a service
- [Lucide](https://lucide.dev/) - Beautiful icons
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generation
- [html2canvas](https://html2canvas.hertzen.com/) - HTML to canvas conversion


## 📧 Contact

Project Link: [https://github.com/PNBFor/the_positron_project](https://github.com/PNBFor/the_positron_project)

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub!

---

Made by v0 and imaginated by Pierre Nguyen
