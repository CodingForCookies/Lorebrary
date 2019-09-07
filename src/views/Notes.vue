<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="4">
        <v-card color="card">
          <v-list dense>
            <v-list-item @click="selected = null">
              <v-list-item-content>
                <v-list-item-title>New Note</v-list-item-title>
              </v-list-item-content>
              <v-list-item-icon>
                <div class="mx-auto">
                  <v-icon small>fas fa-plus</v-icon>
                </div>
              </v-list-item-icon>
            </v-list-item>

            <v-divider />

            <v-list-item v-for="(note, id) in notes" :key="id"
              @click="selected = id">
              <v-list-item-content>
                <v-list-item-title>{{ note.name }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="8">
        <edit-note v-model="note" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import EditNote from '../components/EditNote.vue'

  export default {
    components: {
      EditNote
    },
    data: () => ({
      notes: {
        note1: { id: 'note1', title: 'Race notes', content: [ { "type": "paragraph", "content": [ { "type": "text", "text": "do a thing with stuff, yeah." } ] } ] },
        note2: { id: 'note2', title: 'Potential magic idea', content: [ { "type": "heading", "attrs": { "level": 2 }, "content": [ { "type": "text", "text": "Do" } ] }, { "type": "paragraph", "content": [ { "type": "text", "text": "BOOM POW WEW" } ] }, { "type": "heading", "attrs": { "level": 2 }, "content": [ { "type": "text", "text": "Result" } ] }, { "type": "paragraph", "content": [ { "type": "text", "text": "SMASH WEW THEY GO " }, { "type": "text", "marks": [ { "type": "bold" } ], "text": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" } ] } ] },
        note3: { id: 'note3', title: 'ideas' },
        note4: { id: 'note4', title: 'tgfjhjugfrej' },
        note5: { id: 'note5', title: 'some ideas' },
        note6: { id: 'note6', title: 'check later' },
        note7: { id: 'note7', title: 'rfo4ijf4i' },
        note8: { id: 'note8', title: '2r4pfle' },
      },

      selected: null,

      note: {
        title: '',
        content: []
      } 
    }),
    watch: {
      selected(val) {
        if(val == null) {
          this.$router.replace({ name: (!this.$route.params.universe ? 'Global ' : '') + 'Notes', params: { universe: this.$route.params.universe } });

          this.note = {
            title: '',
            content: []
          };
          return;
        }

        this.note = this.notes[val];

        this.$router.replace({ name: (!this.$route.params.universe ? 'Global ' : '') + 'Notes', params: { universe: this.$route.params.universe, noteId: val } });
      }
    },
    mounted() {
      this.selected = this.$route.params.noteId;
    }
  };
</script>