# Mobile App Icon Generator

A modern, browser-based application for generating mobile app icons for iOS and Android app submissions.

## Features

- Drag-and-drop interface for uploading source images
- Generates all required iOS app icon sizes (for App Store submission)
- Creates Android adaptive icons
- Preview generated icons in the browser
- Download individual icons or all at once
- Client-side processing (no server required)

## Getting Started

### Prerequisites

- Node.js (v14 or later recommended)
- npm or yarn

### Installation

1. Clone this repository
2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Drag and drop an image into the upload area (or click to select a file)
2. Click the "Generate Icons" button
3. Wait for the icons to be generated
4. Preview the generated icons
5. Download individual icons or click "Download All" to get all icons at once

## Icon Sizes Generated

### iOS Icons
- Notification icon (20pt @ 1x, 2x, 3x)
- Settings icon (29pt @ 1x, 2x, 3x)
- Spotlight icon (40pt @ 1x, 2x, 3x)
- App icon (60pt @ 2x, 3x)
- iPad App icon (76pt @ 1x, 2x)
- iPad Pro App icon (83.5pt @ 2x)
- App Store icon (1024pt @ 1x)

### Android Icons
- Adaptive Icon (1024x1024px)
- Splash Icon (200x200px)

## Built With

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Language
- [Chakra UI](https://chakra-ui.com/) - UI components
- [react-dropzone](https://react-dropzone.js.org/) - File uploads

## License

This project is licensed under the MIT License
