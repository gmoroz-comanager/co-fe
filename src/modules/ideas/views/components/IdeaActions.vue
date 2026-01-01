<template>
  <div class="idea-actions-card">
    <div class="actions-row">
      <!-- Feedback Buttons -->
      <div class="feedback-group">
        <v-btn
          color="success"
          variant="outlined"
          prepend-icon="mdi-thumb-up"
          :loading="likeLoading"
          :disabled="dislikeLoading || polishLoading"
          @click="$emit('like')"
        >
          Like
        </v-btn>

        <v-btn
          color="error"
          variant="outlined"
          prepend-icon="mdi-thumb-down"
          :loading="dislikeLoading"
          :disabled="likeLoading || polishLoading"
          @click="$emit('dislike')"
        >
          Dislike
        </v-btn>
      </div>

      <!-- Polish Button with Popover -->
      <v-menu
        v-model="polishMenuOpen"
        :close-on-content-click="false"
        location="top center"
        offset="10"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            color="purple"
            variant="elevated"
            v-bind="props"
            :loading="polishLoading"
            :disabled="likeLoading || dislikeLoading"
            prepend-icon="mdi-auto-fix"
          >
            Polish
          </v-btn>
        </template>

        <v-card min-width="400">
          <v-card-text>
            <p class="mb-2 text-grey-darken-1">
              Optionally, add feedback to guide the AI.
            </p>
            <v-textarea
              v-model="feedback"
              label="e.g., 'Make it funnier', 'Add a call to action'"
              rows="3"
              variant="outlined"
              auto-grow
              hide-details
            ></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text @click="closePolishMenu">Cancel</v-btn>
            <v-btn
              color="purple"
              variant="elevated"
              :loading="polishLoading"
              @click="submitPolish"
            >
              Submit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>

      <!-- Post to Telegram Button -->
      <v-btn
        v-if="hasPolishedContent"
        color="blue"
        variant="elevated"
        prepend-icon="mdi-send"
        :loading="publishing"
        @click="$emit('post')"
      >
        Post to TG
      </v-btn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'IdeaActions',

  props: {
    likeLoading: {
      type: Boolean,
      default: false,
    },
    dislikeLoading: {
      type: Boolean,
      default: false,
    },
    polishLoading: {
      type: Boolean,
      default: false,
    },
    publishing: {
      type: Boolean,
      default: false,
    },
    hasPolishedContent: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['like', 'dislike', 'polish', 'post'],

  setup(props, { emit }) {
    const polishMenuOpen = ref(false);
    const feedback = ref('');

    const closePolishMenu = () => {
      polishMenuOpen.value = false;
    };

    const submitPolish = () => {
      emit('polish', feedback.value);
      // Clear feedback on successful submit will be handled by parent
      // after the request completes
    };

    // Watch for polishLoading to close menu and clear feedback on success
    const resetOnSuccess = () => {
      if (!props.polishLoading && polishMenuOpen.value) {
        // Request finished while menu is open
      }
    };

    return {
      polishMenuOpen,
      feedback,
      closePolishMenu,
      submitPolish,
    };
  },
});
</script>

<style scoped>
.idea-actions-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.actions-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.feedback-group {
  display: flex;
  gap: 12px;
}

@media (max-width: 600px) {
  .actions-row {
    flex-direction: column;
    align-items: stretch;
  }

  .feedback-group {
    flex-direction: column;
  }
}
</style>

