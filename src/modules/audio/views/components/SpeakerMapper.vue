<template>
  <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">Speaker Mapping</h3>
    
    <div v-if="uniqueSpeakers.length === 0" class="text-sm text-gray-500 italic">
      No speakers detected yet.
    </div>

    <div v-else class="space-y-3">
      <div 
        v-for="speaker in uniqueSpeakers" 
        :key="speaker"
        class="flex items-center justify-between bg-white p-2 rounded shadow-sm"
      >
        <div class="flex items-center space-x-3">
          <span class="  bg-blue-100 text-sm font-medium text-gray-900">{{ speaker }}</span>
        </div>

        <div class="flex items-center space-x-2">
          <!-- Display current mapping -->
          <div v-if="isMe(speaker)" class="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-md font-medium flex items-center">
            <v-icon size="small" class="mr-1">mdi-account-circle</v-icon>
            Me
          </div>
          <div v-else-if="getContactName(speaker)" class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md font-medium flex items-center">
            <v-icon size="small" class="mr-1">mdi-account</v-icon>
            {{ getContactName(speaker) }}
          </div>

          <!-- Actions -->
          <button 
            v-if="!isMe(speaker)"
            @click="setAsMe(speaker)"
            class="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded border border-indigo-200 transition-colors"
          >
            This Is Me
          </button>

          <div class="relative">
            <v-menu location="bottom end" :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <button 
                  v-bind="props"
                  class="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200 transition-colors flex items-center"
                >
                  <v-icon size="small" class="mr-1">mdi-link</v-icon>
                  {{ getContactName(speaker) ? 'Change Contact' : 'Link Contact' }}
                </button>
              </template>
              
              <v-card min-width="300" class="pa-3">
                <v-autocomplete
                  v-model="selectedContacts[speaker]"
                  :items="contacts"
                  item-title="name"
                  item-value="id"
                  label="Search contact"
                  density="compact"
                  variant="outlined"
                  hide-details
                  auto-select-first
                  placeholder="Name or Telegram..."
                  return-object
                  @update:modelValue="(val) => linkContact(speaker, val)"
                >
                  <template v-slot:item="{ props, item }">
                    <v-list-item v-bind="props" :subtitle="item.raw.telegramHandle"></v-list-item>
                  </template>
                </v-autocomplete>
              </v-card>
            </v-menu>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, prop, computed, ref, onMounted, watch } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'SpeakerMapper',
  props: {
    transcriptStructure: {
      type: Array,
      default: () => []
    },
    speakersMap: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:speakersMap'],
  
  setup(props, { emit }) {
    const store = useStore();
    const selectedContacts = ref<Record<string, any>>({});

    // Fetch contacts on mount
    onMounted(() => {
      store.dispatch('contacts/fetchContacts', { pageSize: 100 });
    });

    const contacts = computed(() => store.getters['contacts/allItems']);

    const uniqueSpeakers = computed(() => {
      if (!props.transcriptStructure) return [];
      const speakers = new Set<string>();
      props.transcriptStructure.forEach((segment: any) => {
        if (segment.speaker) speakers.add(segment.speaker);
      });
      return Array.from(speakers).sort();
    });

    function isMe(speaker: string): boolean {
      return props.speakersMap[speaker]?.type === 'me';
    }

    function getContactName(speaker: string): string | null {
      if (props.speakersMap[speaker]?.type === 'contact') {
        return props.speakersMap[speaker].name;
      }
      return null;
    }

    function setAsMe(speaker: string) {
      const newMap = { ...props.speakersMap };
      
      // Remove 'me' from other speakers
      Object.keys(newMap).forEach(key => {
        if (newMap[key].type === 'me') {
          delete newMap[key];
        }
      });

      newMap[speaker] = { type: 'me' };
      emit('update:speakersMap', newMap);
    }

    function linkContact(speaker: string, contact: any) {
      if (!contact) return;
      
      const newMap = { ...props.speakersMap };
      newMap[speaker] = {
        type: 'contact',
        contactId: contact.id,
        name: contact.name,
        telegramHandle: contact.telegramHandle
      };
      emit('update:speakersMap', newMap);
      
      // Clear selection after update to keep UI clean, or keep it? 
      // Keeping it in local ref for v-model binding
    }

    return {
      uniqueSpeakers,
      contacts,
      selectedContacts,
      isMe,
      getContactName,
      setAsMe,
      linkContact
    };
  }
});
</script>

