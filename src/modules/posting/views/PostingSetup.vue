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
            <p class="mb-4">Connect your channel by verifying ownership.</p>
            
            <v-select
              v-if="bots.length > 1"
              v-model="selectedBotId"
              :items="bots"
              item-title="username"
              item-value="documentId"
              label="Select Bot"
              variant="outlined"
              class="mb-4"
            ></v-select>

            <div v-if="!verificationCode">
                <p class="mb-4">Click below to generate a verification code.</p>
            </div>

            <div v-else class="text-center my-6">
                <p class="text-h6 mb-2">Verification Code:</p>
                <div class="text-h2 font-weight-bold text-primary mb-4">{{ verificationCode }}</div>
                
                <v-alert type="info" variant="tonal" class="text-left mb-4">
                    <div class="text-subtitle-1 font-weight-bold mb-2">Instructions:</div>
                    <ol class="ml-4">
                        <li>Go to your Telegram Channel.</li>
                        <li>Add <strong>@{{ selectedBot?.username }}</strong> as an Administrator.</li>
                        <li>Send the message: <code class="bg-grey-lighten-3 px-1 rounded">/verify {{ verificationCode }}</code></li>
                    </ol>
                </v-alert>

                <div class="d-flex align-center justify-center">
                    <v-progress-circular indeterminate color="primary" size="24" class="mr-2"></v-progress-circular>
                    <span>Waiting for verification...</span>
                </div>
            </div>

          </v-card-text>
          <v-card-actions>
            <v-btn
              v-if="!verificationCode"
              color="secondary"
              :loading="startingVerification"
              @click="startVerification"
              :disabled="!selectedBotId"
            >
              Start Verification
            </v-btn>
             <v-btn
              v-else
              variant="text"
              color="error"
              @click="cancelVerification"
            >
              Cancel
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
import { defineComponent, ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'PostingSetup',
  setup() {
    const store = useStore();
    
    const botToken = ref('');
    const selectedBotId = ref('');
    const registeringBot = ref(false);
    const botError = ref('');

    const verificationCode = ref('');
    const startingVerification = ref(false);
    let pollingInterval: any = null;

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

    onUnmounted(() => {
        if (pollingInterval) clearInterval(pollingInterval);
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

    const startVerification = async () => {
        if (!selectedBotId.value) return;
        startingVerification.value = true;
        try {
            const res = await store.dispatch('posting/startVerification', selectedBotId.value);
            verificationCode.value = res.code;
            pollingInterval = setInterval(checkStatus, 3000);
        } catch (e: any) {
            showSnackbar(e.message || 'Failed to start verification', 'error');
        } finally {
            startingVerification.value = false;
        }
    };

    const checkStatus = async () => {
        if (!verificationCode.value) return;
        try {
            const res = await store.dispatch('posting/checkVerificationStatus', verificationCode.value);
            if (res.status === 'verified') {
                showSnackbar('Channel verified successfully!', 'success');
                cancelVerification();
                store.dispatch('posting/fetchChannels');
            } else if (res.status === 'expired') {
                showSnackbar('Verification code expired', 'error');
                cancelVerification();
            }
        } catch (e) {
            // ignore
        }
    };

    const cancelVerification = () => {
        verificationCode.value = '';
        if (pollingInterval) clearInterval(pollingInterval);
        pollingInterval = null;
    };

    const showSnackbar = (msg: string, color: string) => {
        snackbarMessage.value = msg;
        snackbarColor.value = color;
        snackbar.value = true;
    };

    return {
      botToken,
      selectedBotId,
      selectedBot,
      bots,
      channels,
      registeringBot,
      botError,
      registerBot,
      startVerification,
      cancelVerification,
      verificationCode,
      startingVerification,
      snackbar,
      snackbarMessage,
      snackbarColor
    };
  }
});
</script>

