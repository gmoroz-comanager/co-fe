#!/bin/bash

# Default values
API_URL="http://localhost:1337/api"
PORT="8080"

# Help function
function show_help {
    echo "Usage: setup-env.sh [options]"
    echo "Options:"
    echo "  --api-url URL   Set the API URL (default: $API_URL)"
    echo "  --port PORT     Set the development server port (default: $PORT)"
    echo "  --help          Show this help message"
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        --api-url)
            API_URL="$2"
            shift
            shift
            ;;
        --port)
            PORT="$2"
            shift
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $key"
            show_help
            exit 1
            ;;
    esac
done

# Create .env file
cat > .env << EOL
VUE_APP_API_URL=${API_URL}
VUE_APP_PORT=${PORT}
EOL

echo "Environment file created with the following configuration:"
echo "API URL: ${API_URL}"
echo "Port: ${PORT}"
