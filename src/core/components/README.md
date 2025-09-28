# Core Components

This directory contains shared components that are used across multiple modules in the application.

## Component Types

### Base Components

Base components provide foundational UI elements with enhanced functionality. They typically extend basic HTML elements or provide simple UI patterns.

Examples:
- `BaseButton.vue` - Enhanced button component with standard styling and states
- `BaseInput.vue` - Input component with validation and formatting
- `BaseCard.vue` - Card container with consistent styling

### Layout Components

Layout components define the structure of pages and sections.

Examples:
- `PageContainer.vue` - Standard page layout with proper spacing
- `SectionContainer.vue` - Container for page sections
- `TwoColumnLayout.vue` - Layout with two columns

### UI Components

Reusable UI components that implement specific UI patterns.

Examples:
- `DataTable.vue` - Table component for displaying data with sorting and filtering
- `ConfirmDialog.vue` - Dialog for confirming user actions
- `Breadcrumbs.vue` - Navigation breadcrumbs

## Naming Conventions

- Use PascalCase for component names
- Prefix base components with "Base" (e.g., `BaseButton.vue`)
- Use descriptive names that indicate the component's purpose

## Component Structure

Each component should follow this structure:

```vue
<template>
  <!-- Template content -->
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ComponentName',
  props: {
    // Props definition
  },
  setup(props, { emit }) {
    // Component logic

    return {
      // Return values for template
    };
  }
});
</script>

<style scoped>
/* Component-specific styles */
</style>
```

## Best Practices

1. Keep components focused on a single responsibility
2. Document props, events, and slots with JSDoc comments
3. Use TypeScript interfaces for props and events
4. Make components as reusable as possible
5. Avoid dependencies on specific modules or features
6. Use props for configuration and customization
7. Emit events for communication with parent components
