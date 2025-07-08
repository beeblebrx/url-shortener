# URL Shortener Frontend

A React TypeScript frontend for the URL shortener application that displays and manages shortened URLs.

## Features

- **URL Listing**: View all shortened URLs with pagination
- **Sorting**: Sort URLs by creation date, expiration date, click count, or short code
- **Filtering**: Configurable items per page (20, 50, 100)
- **Status Indicators**: Visual badges for active, expired, and permanent URLs
- **Click Statistics**: Display click counts and last accessed times
- **Responsive Design**: Mobile-friendly interface
- **Real-time Data**: Fetches data from the backend API

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

Create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to be deployed to any static web server.

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

## Project Structure

```
src/
├── components/          # React components
│   ├── UrlList.tsx     # Main URL listing component
│   ├── UrlItem.tsx     # Individual URL row component
│   ├── Pagination.tsx  # Pagination controls
│   └── SortControls.tsx # Sort and filter controls
├── services/           # API services
│   └── api.ts          # Backend API integration
├── types/              # TypeScript type definitions
│   └── index.ts        # API response types
├── utils/              # Utility functions
│   └── formatters.ts   # Date and text formatting
├── styles/             # CSS styles
│   └── main.css        # Main stylesheet
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

## API Integration

The frontend connects to the backend API at `http://localhost:5000` and uses the following endpoint:

- `GET /urls` - Fetch paginated and sorted URL list

The webpack dev server includes a proxy configuration to forward API requests to the backend.

## Deployment

The built application in the `dist/` directory is a static website that can be deployed to:

- Static hosting services (Netlify, Vercel, GitHub Pages)
- Web servers (Apache, Nginx)
- CDNs (CloudFront, CloudFlare)

Make sure to configure your web server to:
1. Serve the `index.html` file for all routes
2. Proxy API requests to your backend server
3. Set appropriate cache headers for static assets

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features are transpiled to ES5 for broader compatibility
- Responsive design works on mobile and desktop devices
