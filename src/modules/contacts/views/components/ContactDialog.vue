<template>
  <v-dialog v-model="dialog" max-width="600px">
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ isEdit ? 'Edit Contact' : 'New Contact' }}</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-form ref="form" v-model="valid" @submit.prevent="save">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="formData.name"
                  label="Name"
                  required
                  :rules="[v => !!v || 'Name is required']"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.email"
                  label="Email"
                  type="email"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.telegramHandle"
                  label="Telegram Handle"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.jobTitle"
                  label="Job Title"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="formData.externalId"
                  label="External ID"
                ></v-text-field>
              </v-col>
              <!-- 
              <v-col cols="12">
                <v-textarea
                  v-model="formData.description" 
                  label="Description"
                  rows="3"
                ></v-textarea>
              </v-col>
               -->
            </v-row>
          </v-form>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue darken-1" variant="text" @click="close">Cancel</v-btn>
        <v-btn color="blue darken-1" variant="text" @click="save" :loading="loading">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch, computed } from 'vue';
import { Contact } from '../../api/contacts.service';

export default defineComponent({
  name: 'ContactDialog',
  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    contact: {
      type: Object as () => Contact | null,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'save'],
  setup(props, { emit }) {
    const valid = ref(false);
    const form = ref<any>(null);
    
    const formData = ref({
      name: '',
      email: '',
      telegramHandle: '',
      jobTitle: '',
      externalId: '',
      // description: '' 
    });

    const isEdit = computed(() => !!props.contact);

    const dialog = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    });

    watch(() => props.contact, (newVal) => {
      if (newVal) {
        formData.value = {
          name: newVal.name,
          email: newVal.email || '',
          telegramHandle: newVal.telegramHandle || '',
          jobTitle: newVal.jobTitle || '',
          externalId: newVal.externalId || '',
        };
      } else {
        resetForm();
      }
    }, { immediate: true });

    watch(dialog, (val) => {
      if (!val) {
        // Optional: reset on close if desired
      } else if (!props.contact) {
        resetForm();
      }
    });

    function resetForm() {
      formData.value = {
        name: '',
        email: '',
        telegramHandle: '',
        jobTitle: '',
        externalId: '',
      };
    }

    function close() {
      dialog.value = false;
    }

    async function save() {
      if (!form.value) return;
      const { valid: isValid } = await form.value.validate();
      
      if (isValid) {
        // Create a payload with only non-empty values
        const payload: any = { name: formData.value.name };
        
        if (formData.value.email) payload.email = formData.value.email;
        if (formData.value.telegramHandle) payload.telegramHandle = formData.value.telegramHandle;
        if (formData.value.jobTitle) payload.jobTitle = formData.value.jobTitle;
        if (formData.value.externalId) payload.externalId = formData.value.externalId;
        
        emit('save', payload);
      }
    }

    return {
      dialog,
      valid,
      form,
      formData,
      isEdit,
      close,
      save
    };
  }
});
</script>

