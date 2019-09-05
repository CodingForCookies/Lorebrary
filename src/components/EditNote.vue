<template>
  <v-card>
    <v-text-field
      label="Note Name"
      v-model="note.name"
      filled
      hide-details />
    
    <v-card-text>
      <v-sheet class="pa-3 editor-container">
        <editor v-model="note.content" />
      </v-sheet>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn text color="success"
          @click="save">
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
    props: ['value'],
    data: () => ({
      note: {
        name: '',
        content: []
      } 
    }),
    watch: {
      value(val) {
        this.note = val;
      }
    },
    methods: {
      save() {
        this.$emit('input', this.note);
      }
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