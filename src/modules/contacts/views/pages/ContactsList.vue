<template>
  <v-container>
    <v-row class="mb-4">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1 class="text-h3">Contacts</h1>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
          Add Contact
        </v-btn>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading && !allContacts.length">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <!-- Error -->
    <v-row v-else-if="error">
      <v-col cols="12">
        <v-alert type="error" title="Error" :text="error"></v-alert>
      </v-col>
    </v-row>

    <!-- Data -->
    <v-row v-else>
      <v-col cols="12">
        <v-card>
          <v-data-table
            :headers="headers"
            :items="allContacts"
            :loading="loading"
            hover
          >
            <template v-slot:item.name="{ item }">
              <div class="d-flex align-center">
                <span>{{ item.name }}</span>
                <v-chip
                  v-if="item.documentId === 'me'"
                  color="primary"
                  size="x-small"
                  class="ml-2"
                  variant="flat"
                >
                  ME
                </v-chip>
              </div>
            </template>

            <template v-slot:item.actions="{ item }">
              <template v-if="item.documentId !== 'me'">
                <v-btn icon variant="text" size="small" color="primary" @click="openEditDialog(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon variant="text" size="small" color="error" @click="deleteItem(item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <template v-else>
                <v-btn 
                  variant="text" 
                  size="small" 
                  color="primary" 
                  to="/brand-profile"
                  prepend-icon="mdi-account-edit"
                >
                  Edit Profile
                </v-btn>
              </template>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialogVisible" max-width="500">
      <v-card>
        <v-card-title class="text-h5">Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete contact "{{ contactToDelete?.name }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="deleteDialogVisible = false">Cancel</v-btn>
          <v-btn color="error" variant="text" @click="confirmDelete" :loading="loading">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <contact-dialog
      v-model="dialogVisible"
      :contact="selectedContact"
      :loading="loading"
      @save="handleSave"
    />
  </v-container>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import ContactDialog from '../components/ContactDialog.vue';
import { Contact } from '../../api/contacts.service';

export default defineComponent({
  name: 'ContactsList',
  components: {
    ContactDialog
  },
  setup() {
    const store = useStore();
    const dialogVisible = ref(false);
    const selectedContact = ref<Contact | null>(null);
    
    // Delete dialog state
    const deleteDialogVisible = ref(false);
    const contactToDelete = ref<Contact | null>(null);

    const contacts = computed(() => store.getters['contacts/allItems'] || []);
    const loading = computed(() => store.getters['contacts/isLoading']);
    const error = computed(() => store.getters['contacts/getError']);
    const currentUser = computed(() => store.getters['auth/currentUser']);

    const allContacts = computed(() => {
      const list: Contact[] = [];

      // Add "Me" virtual contact
      if (currentUser.value) {
        list.push({
          id: -1,
          documentId: 'me',
          name: currentUser.value.username || 'Me',
          email: currentUser.value.email,
          jobTitle: 'You',
          telegramHandle: '', 
          externalId: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Contact);
      }

      if (Array.isArray(contacts.value)) {
        list.push(...contacts.value);
      }
      
      return list;
    });

    const headers: any[] = [
      { title: 'Name', key: 'name', align: 'start' },
      { title: 'Email', key: 'email' },
      { title: 'Job Title', key: 'jobTitle' },
      { title: 'Telegram', key: 'telegramHandle' },
      { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
    ];

    onMounted(() => {
      fetchContacts();
    });

    function fetchContacts() {
      store.dispatch('contacts/fetchContacts');
    }

    function openCreateDialog() {
      selectedContact.value = null;
      dialogVisible.value = true;
    }

    function openEditDialog(item: Contact) {
      selectedContact.value = item;
      dialogVisible.value = true;
    }

    async function handleSave(formData: Partial<Contact>) {
      try {
        if (selectedContact.value) {
          await store.dispatch('contacts/updateContact', {
            id: selectedContact.value.documentId,
            data: formData
          });
        } else {
          await store.dispatch('contacts/createContact', formData);
        }
        dialogVisible.value = false;
      } catch (e) {
        console.error(e);
      }
    }

    function deleteItem(item: Contact) {
      contactToDelete.value = item;
      deleteDialogVisible.value = true;
    }

    async function confirmDelete() {
      if (!contactToDelete.value) return;
      
      try {
        await store.dispatch('contacts/deleteContact', contactToDelete.value.documentId);
        deleteDialogVisible.value = false;
        contactToDelete.value = null;
      } catch (e) {
        console.error(e);
      }
    }

    return {
      allContacts,
      loading,
      error,
      headers,
      dialogVisible,
      selectedContact,
      openCreateDialog,
      openEditDialog,
      handleSave,
      deleteItem,
      deleteDialogVisible,
      contactToDelete,
      confirmDelete
    };
  }
});
</script>

