# COMANAGER Frontend

Vue.js-based frontend application for managing audio files with Strapi backend.

## Features

- User authentication (login/registration)
- Audio file management
  - Upload audio files
  - Add transcription
  - Add ideas/notes in rich text format
- Integration with Strapi CMS backend

## Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Running Strapi backend server

## Setup

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Configure environment variables:

Create a `.env` file in the root directory with the following content:

```
VUE_APP_API_URL=http://localhost:1337/api
VUE_APP_PORT=8080
```

Adjust the URL if your Strapi server is running on a different host or port. The `VUE_APP_PORT` variable allows you to change the development server port if needed.

3. Start the development server:

```bash
npm run serve
# or
yarn serve
```

The application will be available at http://localhost:8080

## Build for production

```bash
npm run build
# or
yarn build
```

The build assets will be located in the `dist` directory.

## Docker Deployment

A Dockerfile is included for containerized deployment:

1. Build the Docker image:

```bash
docker build -t comanager-frontend .
```

2. Run the container:

```bash
docker run -p 8080:80 -e VUE_APP_API_URL=http://your-api-url/api comanager-frontend
```

For production environments, you can create a `.env.production` file with production settings.

## Folder Structure

- `/src` - Application source code
  - `/components` - Vue components
  - `/views` - Vue pages/views
  - `/store` - Vuex store modules
  - `/router` - Vue Router configuration
  - `/assets` - Static assets

## API Integration

The frontend connects to the Strapi backend for:
- User authentication (login/registration)
- CRUD operations for audio files

## Audio Schema

The audio files follow this schema:
- title (string)
- audio_file (media, multiple)
- transcription (text)
- ideas (richtext)
