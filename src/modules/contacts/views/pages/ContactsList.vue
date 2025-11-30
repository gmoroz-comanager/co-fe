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
    <v-row v-if="loading && !contacts.length">
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
            :items="contacts"
            :loading="loading"
            hover
          >
            <template v-slot:item.actions="{ item }">
              <v-btn icon variant="text" size="small" color="primary" @click="openEditDialog(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon variant="text" size="small" color="error" @click="deleteItem(item)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

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

    const contacts = computed(() => store.getters['contacts/allItems']);
    const loading = computed(() => store.getters['contacts/isLoading']);
    const error = computed(() => store.getters['contacts/getError']);

    const headers = [
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

    async function deleteItem(item: Contact) {
      if (confirm(`Are you sure you want to delete ${item.name}?`)) {
        await store.dispatch('contacts/deleteContact', item.documentId);
      }
    }

    return {
      contacts,
      loading,
      error,
      headers,
      dialogVisible,
      selectedContact,
      openCreateDialog,
      openEditDialog,
      handleSave,
      deleteItem
    };
  }
});
</script>

