<template>
  <v-card v-if="note">
    <v-text-field
      label="Note Name"
      v-model="note.name"
      :readonly="loading"
      filled
      hide-details />
    
    <v-card-text>
      <v-sheet class="pa-3 editor-container">
        <editor
          class="pa-4"
          :readonly="loading"
          v-model="note"
          min-height="350" />
      </v-sheet>
    </v-card-text>

    <v-card-actions>
      <v-btn v-if="canDelete"
          text color="error"
          :loading="loading"
          @click="$emit('delete')">
        <v-icon small>fas fa-trash</v-icon>
        Delete
      </v-btn>
      <v-spacer />
      <v-btn text color="success"
          :loading="loading"
          @click="$emit('save', note)">
        <v-icon small>fas fa-check</v-icon>
        Save
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
  import Editor from '../components/Editor.vue'

  export default {
    components: {
      Editor
    },
    props: ['value', 'canDelete', 'loading'],
    data: () => ({
      note: null
    }),
    watch: {
      value(val) {
        this.note = val.copy();
      }
    },
    mounted() {
      this.note = this.value;
    }
  };
</script>

<style scoped>
  .editor-container {
    background: rgba(0, 0, 0, .075);
  }
  
  .editor-container.theme--dark {
    background: rgba(0, 0, 0, .1);
  }
</style>