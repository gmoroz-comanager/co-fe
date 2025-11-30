<template>
  <div class="speaker-mapper bg-white rounded-lg shadow-sm p-4 mb-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800">Speaker Mapping</h3>
      <span class="text-xs text-gray-500" v-if="uniqueSpeakers.length">
        {{ uniqueSpeakers.length }} detected speaker{{ uniqueSpeakers.length !== 1 ? 's' : '' }}
      </span>
    </div>
    
    <div v-if="uniqueSpeakers.length === 0" class="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-200 text-gray-500">
      No speakers detected in this transcription.
    </div>

    <div v-else class="space-y-3">
      <div 
        v-for="speaker in uniqueSpeakers" 
        :key="speaker"
        class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <!-- Left: Speaker Identity -->
        <div class="flex items-center space-x-3">
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm"
            :class="getAvatarClass(speaker)"
          >
            {{ getInitials(speaker) }}
          </div>
          <div class="flex flex-col">
            <span class="font-medium text-gray-900 text-sm">{{ speaker }}</span>
            <span class="text-xs text-gray-500" v-if="!getMappingState(speaker)">Unassigned</span>
          </div>
        </div>

        <!-- Middle: Arrow (Visual connector) -->
        <div class="hidden sm:flex text-gray-300">
          <v-icon>mdi-arrow-right</v-icon>
        </div>

        <!-- Right: Action Area -->
        <div class="flex items-center justify-end min-w-[200px]">
          
          <!-- State: Assigned to Me -->
          <div v-if="isMe(speaker)" class="flex items-center space-x-2 animate-fade-in">
            <div class="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium flex items-center shadow-sm">
              <v-icon size="small" class="mr-1.5">mdi-account-circle</v-icon>
              It's Me
            </div>
            <button 
              @click="resetMapping(speaker)"
              class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Unassign"
            >
              <v-icon size="small">mdi-close</v-icon>
            </button>
          </div>

          <!-- State: Assigned to Contact -->
          <div v-else-if="getContactName(speaker)" class="flex items-center space-x-2 animate-fade-in">
            <div class="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center shadow-sm max-w-[180px]">
              <v-icon size="small" class="mr-1.5">mdi-account-check</v-icon>
              <span class="truncate">{{ getContactName(speaker) }}</span>
            </div>
            <button 
              @click="resetMapping(speaker)"
              class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Unassign"
            >
              <v-icon size="small">mdi-close</v-icon>
            </button>
          </div>

          <!-- State: Unassigned -->
          <div v-else class="flex items-center space-x-2">
            <button 
              @click="setAsMe(speaker)"
              class="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 rounded text-sm font-medium transition-all shadow-sm"
            >
              It's Me
            </button>

            <div class="relative w-48">
              <v-autocomplete
                v-model="selectedContacts[speaker]"
                :items="contacts"
                item-title="name"
                item-value="id"
                density="compact"
                variant="outlined"
                hide-details
                bg-color="white"
                placeholder="Link Contact..."
                return-object
                class="contact-select"
                @update:modelValue="(val) => linkContact(speaker, val)"
              >
                <template v-slot:prepend-item>
                  <v-list-item
                    title="Create New Contact"
                    prepend-icon="mdi-plus"
                    color="primary"
                    class="text-primary font-weight-bold bg-blue-50 mb-1"
                    @click="openCreateContact(speaker)"
                  ></v-list-item>
                  <v-divider class="mb-1"></v-divider>
                </template>
                
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" :subtitle="(item?.raw as any)?.telegramHandle || (item?.raw as any)?.jobTitle"></v-list-item>
                </template>
              </v-autocomplete>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Quick Contact Dialog -->
    <ContactDialog 
      v-model="showContactDialog"
      :loading="isCreatingContact"
      @save="handleCreateContact"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import ContactDialog from '@/modules/contacts/views/components/ContactDialog.vue';

export default defineComponent({
  name: 'SpeakerMapper',
  components: {
    ContactDialog
  },
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
    const showContactDialog = ref(false);
    const isCreatingContact = ref(false);
    const activeSpeakerForCreation = ref<string | null>(null);

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

    // Helper to generate consistent avatar colors
    function getAvatarClass(speaker: string): string {
      const colors = [
        'bg-blue-100 text-blue-700',
        'bg-green-100 text-green-700',
        'bg-purple-100 text-purple-700',
        'bg-yellow-100 text-yellow-700',
        'bg-pink-100 text-pink-700',
        'bg-indigo-100 text-indigo-700',
      ];
      // Simple hash to pick a color
      const index = speaker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
      return colors[index];
    }

    function getInitials(speaker: string): string {
        // Try to get initials if speaker name has spaces, otherwise first 2 chars
        const parts = speaker.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return speaker.substring(0, 2).toUpperCase();
    }

    function isMe(speaker: string): boolean {
      return props.speakersMap[speaker]?.type === 'me';
    }

    function getContactName(speaker: string): string | null {
      if (props.speakersMap[speaker]?.type === 'contact') {
        return props.speakersMap[speaker].name;
      }
      return null;
    }

    function getMappingState(speaker: string): string | null {
        if (isMe(speaker)) return 'me';
        if (getContactName(speaker)) return 'contact';
        return null;
    }

    function resetMapping(speaker: string) {
        const newMap = { ...props.speakersMap };
        delete newMap[speaker];
        emit('update:speakersMap', newMap);
        selectedContacts.value[speaker] = null;
    }

    function setAsMe(speaker: string) {
      const newMap = { ...props.speakersMap };
      
      // Remove 'me' from other speakers (ensure uniqueness of Me)
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
    }

    // --- Quick Create Contact Logic ---

    function openCreateContact(speaker: string) {
        // Close autocomplete dropdown (blur hack might be needed if v-model update doesn't trigger)
        activeSpeakerForCreation.value = speaker;
        showContactDialog.value = true;
    }

    async function handleCreateContact(contactData: any) {
        if (!activeSpeakerForCreation.value) return;
        
        isCreatingContact.value = true;
        try {
            // Create the contact
            const newContact = await store.dispatch('contacts/createContact', contactData);
            
            // Link it immediately
            linkContact(activeSpeakerForCreation.value, newContact);
            
            showContactDialog.value = false;
            activeSpeakerForCreation.value = null;
        } catch (error) {
            console.error('Failed to quick create contact', error);
            // Ideally show a snackbar here or emit error
        } finally {
            isCreatingContact.value = false;
        }
    }

    return {
      uniqueSpeakers,
      contacts,
      selectedContacts,
      showContactDialog,
      isCreatingContact,
      isMe,
      getContactName,
      setAsMe,
      linkContact,
      resetMapping,
      getMappingState,
      getAvatarClass,
      getInitials,
      openCreateContact,
      handleCreateContact
    };
  }
});
</script>

<style scoped>
.contact-select :deep(.v-field__input) {
    font-size: 0.875rem;
    padding-top: 6px;
    padding-bottom: 6px;
    min-height: 32px;
}
.animate-fade-in {
    animation: fadeIn 0.2s ease-in-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(2px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
