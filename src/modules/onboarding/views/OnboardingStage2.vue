<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="d-flex flex-column" style="height: 80vh;" elevation="3">
          <v-card-title class="pa-4">
            Brand Profile Interview
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="flex-grow-1 overflow-y-auto pa-4">
            <div v-for="(msg, index) in messages" :key="index" :class="['d-flex', 'mb-4', msg.role === 'user' ? 'justify-end' : 'justify-start']">
              <v-sheet
                :color="msg.role === 'user' ? 'primary' : 'grey-lighten-3'"
                rounded="lg"
                class="pa-3"
                max-width="80%"
              >
                <div v-if="msg.role === 'assistant'" v-html="formatMessage(msg.content)"></div>
                <p v-else class="text-body-1" :class="{'text-white': msg.role === 'user'}">{{ msg.content }}</p>
              </v-sheet>
            </div>
             <div v-if="loading" class="d-flex justify-start">
                <v-sheet color="grey-lighten-3" rounded="lg" class="pa-3" max-width="80%">
                    <v-progress-circular indeterminate color="primary" size="20" width="2"></v-progress-circular>
                </v-sheet>
            </div>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="pa-4">
            <v-textarea
              v-model="newMessage"
              label="Type your message... (Cmd/Ctrl+Enter to send)"
              variant="outlined"
              hide-details
              rows="2"
              auto-grow
              @keydown.enter.meta.prevent="sendMessage"
              @keydown.enter.ctrl.prevent="sendMessage"
              :disabled="loading"
            ></v-textarea>
            <v-btn class="ml-4" icon="mdi-send" color="primary" @click="sendMessage" :loading="loading" :disabled="!newMessage.trim()"></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { onboardingService } from '../api';
import { marked } from 'marked';

export default defineComponent({
  name: 'OnboardingStage2',
  setup() {
    const router = useRouter();
    const store = useStore();
    const messages = ref<any[]>([]);
    const newMessage = ref('');
    const loading = ref(false);

    const formatMessage = (content: string) => {
      // Replace newlines with <br> and then parse Markdown
      return marked(content.replace(/\n/g, '<br>'));
    };

    const initChat = async () => {
      loading.value = true;
      try {
        const history = await onboardingService.initStage2Chat();
        messages.value = history;
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      } finally {
        loading.value = false;
      }
    };

    const sendMessage = async () => {
      if (!newMessage.value.trim()) return;

      const userMessage = {
        role: 'user',
        content: newMessage.value.trim()
      };
      messages.value.push(userMessage);
      const messageToSend = newMessage.value;
      newMessage.value = '';
      loading.value = true;

      try {
        const { response, isComplete } = await onboardingService.postStage2Message(messageToSend);
        messages.value.push({
          role: 'assistant',
          content: response.content
        });
        
        if (isComplete) {
            await store.dispatch('auth/refreshUser');
            router.push({ name: 'Home' });
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(initChat);

    return { messages, newMessage, sendMessage, loading, formatMessage };
  },
});
</script>
