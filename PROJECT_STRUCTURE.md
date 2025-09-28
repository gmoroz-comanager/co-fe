# CoFlow Frontend Project Structure

This document outlines the modular project structure used in the CoFlow frontend application, following best practices for large-scale Vue.js applications.

## Core Principles

- **Modularity**: Each feature area is self-contained with its own views, API services, store modules, and routes
- **Predictability**: Consistent patterns make it easy to locate code and understand its purpose
- **Reusability**: Services and components are designed to be reused across the application
- **Separation of Concerns**: Clear boundaries between different parts of the application

## Directory Structure

```
src/
├── core/                     # Core application functionality
│   ├── api/                  # Core API services
│   ├── components/           # Shared/common components
│   ├── helpers/              # Utility functions
│   ├── plugins/              # Vue plugins
│   ├── router/               # Main router configuration
│   └── store/                # Main store configuration
├── modules/                  # Feature modules
│   ├── auth/                 # Authentication module
│   │   ├── api/              # Auth API services
│   │   ├── router/           # Auth routes
│   │   ├── store/            # Auth store module
│   │   └── views/            # Auth views (Login, Register)
│   ├── ideas/                # Ideas module
│   │   ├── api/              # Ideas API services
│   │   ├── router/           # Ideas routes
│   │   ├── store/            # Ideas store module
│   │   └── views/            # Ideas views (List, Detail)
│   └── audio/                # Audio module
│       ├── api/              # Audio API services
│       ├── router/           # Audio routes
│       ├── store/            # Audio store module
│       └── views/            # Audio views
├── views/                    # Global views (Home)
├── App.vue                   # Root component
└── main.ts                   # Application entry point
```

## Module Structure

Each module follows a consistent structure:

### API

- `service.ts`: Service class for API communication
- `index.ts`: Exports the service

### Router

- `index.ts`: Defines and exports routes for the module

### Store

- `module.ts`: Vuex store module
- `index.ts`: Exports the store module

### Views

- Component files for the module's views

## Core Services

### API Service

The core API service (`core/api/http.ts`) provides:

- Centralized HTTP client configuration
- Authentication token management
- Error handling
- Common request methods (get, post, put, delete)

### Components

The core components directory (`core/components/`) contains:

- Shared UI components used across multiple modules
- Base components that provide common functionality
- Layout components that define page structures

### Store

The main store (`core/store/index.ts`) combines all module stores into a single Vuex store.

### Router

The main router (`core/router/index.ts`) combines all module routes and defines global navigation guards.

## Best Practices

1. **API Communication**: Always use the module's API service for backend communication
2. **State Management**: Store module-specific state in the module's store
3. **Navigation**: Define routes in the module's router and export them to the main router
4. **Naming Conventions**: Use consistent naming across the application
   - PascalCase for components and views
   - camelCase for services, stores, and methods
   - kebab-case for files and directories

## Adding New Features

To add a new feature:

1. Create a new module directory in `src/modules/`
2. Add the required subdirectories (api, router, store, views)
3. Implement the feature's functionality
4. Export the module's router to the main router
5. Export the module's store to the main store
