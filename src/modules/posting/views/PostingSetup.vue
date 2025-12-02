<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-6">Telegram Integration Setup</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card class="mb-6">
          <v-card-title class="text-h5">1. Connect Telegram Bot</v-card-title>
          <v-card-text>
            <p class="mb-4">To post messages, you need to create a Telegram Bot.</p>
            <ol class="ml-4 mb-4">
              <li>Open <a href="https://t.me/BotFather" target="_blank">@BotFather</a> in Telegram.</li>
              <li>Send command <code>/newbot</code>.</li>
              <li>Follow instructions to name your bot.</li>
              <li>Copy the <strong>HTTP API Token</strong> provided by BotFather.</li>
            </ol>

            <v-text-field
              v-model="botToken"
              label="Bot Token"
              placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
              variant="outlined"
              :error-messages="botError"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              :loading="registeringBot"
              @click="registerBot"
              :disabled="!botToken"
            >
              Connect Bot
            </v-btn>
          </v-card-actions>

          <v-list v-if="bots.length > 0" class="mt-2 bg-grey-lighten-4">
            <v-list-subheader>Connected Bots</v-list-subheader>
            <v-list-item v-for="bot in bots" :key="bot.documentId" :title="bot.first_name" :subtitle="'@' + bot.username">
              <template v-slot:prepend>
                <v-icon color="success">mdi-robot</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card :disabled="bots.length === 0">
          <v-card-title class="text-h5">2. Connect Channel</v-card-title>
          <v-card-text>
            <p class="mb-4">Add your bot to your Telegram channel as an Administrator.</p>
            <ol class="ml-4 mb-4">
              <li>Go to your Channel Settings > Administrators.</li>
              <li>Add your bot (@{{ selectedBot?.username || 'your_bot' }}) as an admin.</li>
              <li>Ensure it has "Post Messages" permission.</li>
              <li>Enter your Channel Username (e.g. @mychannel) or ID below.</li>
            </ol>

            <v-select
              v-if="bots.length > 1"
              v-model="selectedBotId"
              :items="bots"
              item-title="username"
              item-value="documentId"
              label="Select Bot"
              variant="outlined"
              class="mb-2"
            ></v-select>

            <v-text-field
              v-model="channelIdentifier"
              label="Channel Username or ID"
              placeholder="@my_awesome_channel"
              variant="outlined"
              hint="Bot will send a test message and delete it."
              persistent-hint
              :error-messages="channelError"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="secondary"
              :loading="verifyingChannel"
              @click="verifyChannel"
              :disabled="!channelIdentifier || !selectedBotId"
            >
              Verify Channel
            </v-btn>
          </v-card-actions>

           <v-list v-if="channels.length > 0" class="mt-2 bg-grey-lighten-4">
            <v-list-subheader>Connected Channels</v-list-subheader>
            <v-list-item v-for="channel in channels" :key="channel.documentId" :title="channel.title" :subtitle="channel.username ? '@' + channel.username : channel.channelId">
              <template v-slot:prepend>
                <v-icon color="blue">mdi-bullhorn</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" :color="snackbarColor">
        {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'PostingSetup',
  setup() {
    const store = useStore();
    
    const botToken = ref('');
    const channelIdentifier = ref('');
    const selectedBotId = ref('');
    const registeringBot = ref(false);
    const verifyingChannel = ref(false);
    const botError = ref('');
    const channelError = ref('');

    const snackbar = ref(false);
    const snackbarMessage = ref('');
    const snackbarColor = ref('success');

    const bots = computed(() => store.getters['posting/bots']);
    const channels = computed(() => store.getters['posting/channels']);

    const selectedBot = computed(() => bots.value.find((b: any) => b.documentId === selectedBotId.value));

    onMounted(() => {
      store.dispatch('posting/fetchBots');
      store.dispatch('posting/fetchChannels');
    });

    // Auto-select first bot
    watch(bots, (newBots) => {
        if (newBots.length > 0 && !selectedBotId.value) {
            selectedBotId.value = newBots[0].documentId;
        }
    });

    const registerBot = async () => {
      botError.value = '';
      registeringBot.value = true;
      try {
        await store.dispatch('posting/registerBot', botToken.value);
        botToken.value = '';
        showSnackbar('Bot connected successfully!', 'success');
      } catch (e: any) {
        botError.value = e.message || 'Failed to connect bot';
        showSnackbar('Failed to connect bot', 'error');
      } finally {
        registeringBot.value = false;
      }
    };

    const verifyChannel = async () => {
      channelError.value = '';
      verifyingChannel.value = true;
      try {
        await store.dispatch('posting/verifyChannel', {
            botDocumentId: selectedBotId.value,
            channelIdentifier: channelIdentifier.value
        });
        channelIdentifier.value = '';
        showSnackbar('Channel verified successfully!', 'success');
      } catch (e: any) {
        channelError.value = e.message || 'Failed to verify channel';
        showSnackbar('Failed to verify channel', 'error');
      } finally {
        verifyingChannel.value = false;
      }
    };

    const showSnackbar = (msg: string, color: string) => {
        snackbarMessage.value = msg;
        snackbarColor.value = color;
        snackbar.value = true;
    };

    return {
      botToken,
      channelIdentifier,
      selectedBotId,
      selectedBot,
      bots,
      channels,
      registeringBot,
      verifyingChannel,
      botError,
      channelError,
      registerBot,
      verifyChannel,
      snackbar,
      snackbarMessage,
      snackbarColor
    };
  }
});
</script>

