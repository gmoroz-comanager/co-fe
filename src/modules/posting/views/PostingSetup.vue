<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3 mb-6">Telegram Integration Setup</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card class="mb-6">
          <v-card-title class="text-h5">Connect Telegram Bot</v-card-title>
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
        </v-card>
      </v-col>
    </v-row>

    <v-row>
        <v-col cols="12" md="7">
            <h2 class="text-h5 mb-4">Connected Bots & Channels</h2>
             <v-expansion-panels variant="accordion" multiple>
                <v-expansion-panel v-for="bot in bots" :key="bot.documentId">
                    <v-expansion-panel-title>
                        <v-icon color="success" class="mr-3">mdi-robot</v-icon>
                        <div>
                            <div class="font-weight-bold">{{ bot.first_name }}</div>
                            <div class="text-caption text-medium-emphasis">@{{ bot.username }}</div>
                        </div>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <div class="d-flex align-center justify-space-between mb-4">
                            <span class="text-subtitle-2">Channels</span>
                            <v-btn size="small" variant="text" color="primary" @click="startVerification(bot.documentId)">
                                <v-icon start>mdi-plus</v-icon>
                                Add Channel
                            </v-btn>
                        </div>

                         <v-list v-if="bot.channels && bot.channels.length > 0" density="compact" class="bg-grey-lighten-5 rounded">
                            <v-list-item v-for="channel in bot.channels" :key="channel.documentId" :title="channel.title" :subtitle="channel.username ? '@' + channel.username : channel.channelId">
                                <template v-slot:prepend>
                                    <v-icon color="blue" size="small">mdi-bullhorn</v-icon>
                                </template>
                            </v-list-item>
                         </v-list>
                         <div v-else class="text-center text-caption pa-4 bg-grey-lighten-5 rounded">
                            No channels connected to this bot.
                         </div>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>

            <div v-if="bots.length === 0" class="text-center pa-6 bg-grey-lighten-4 rounded mt-4">
                No bots connected yet. Add one above.
            </div>
        </v-col>

        <v-col cols="12" md="5">
            <v-card v-if="verificationCode" class="position-sticky" style="top: 20px">
                <v-card-title class="bg-primary text-white">
                    Verify Channel
                </v-card-title>
                <v-card-text class="pt-4">
                     <p class="text-subtitle-1 mb-2">Connecting channel for <strong>@{{ selectedBotForVerification?.username }}</strong></p>
                    
                     <div class="text-center my-6">
                        <p class="text-h6 mb-2">Verification Code:</p>
                        <div class="text-h2 font-weight-bold text-primary mb-4">{{ verificationCode }}</div>
                        
                        <div class="d-flex align-center justify-center">
                            <v-progress-circular indeterminate color="primary" size="24" class="mr-2"></v-progress-circular>
                            <span>Waiting for /verify command...</span>
                        </div>
                    </div>

                    <v-alert type="info" variant="tonal" class="text-left mb-4">
                        <div class="text-subtitle-1 font-weight-bold mb-2">Instructions:</div>
                        <ol class="ml-4">
                            <li>Go to your Telegram Channel.</li>
                            <li>Add <strong>@{{ selectedBotForVerification?.username }}</strong> as an Administrator.</li>
                            <li>Send message: <code class="bg-grey-lighten-3 px-1 rounded">/verify {{ verificationCode }}</code></li>
                        </ol>
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" variant="text" @click="cancelVerification">Cancel</v-btn>
                </v-card-actions>
            </v-card>
             <v-card v-else class="bg-grey-lighten-4 d-flex align-center justify-center" height="200" variant="flat">
                <div class="text-center text-medium-emphasis">
                    <v-icon size="48" class="mb-2">mdi-arrow-left</v-icon>
                    <div>Select "Add Channel" on a bot to start verification</div>
                </div>
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
    const selectedBotForVerification = computed(() => bots.value.find((b: any) => b.documentId === selectedBotId.value));

    onMounted(() => {
      store.dispatch('posting/fetchBots');
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
        store.dispatch('posting/fetchBots'); // Refresh list
      } catch (e: any) {
        botError.value = e.message || 'Failed to connect bot';
        showSnackbar('Failed to connect bot', 'error');
      } finally {
        registeringBot.value = false;
      }
    };

    const startVerification = async (botId: string) => {
        if (!botId) return;
        selectedBotId.value = botId; // Set selected bot for instructions
        startingVerification.value = true;
        try {
            const res = await store.dispatch('posting/startVerification', botId);
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
                store.dispatch('posting/fetchBots'); // Refresh bots to get updated channels
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
      selectedBotForVerification,
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

