<template>
  <v-container>
    <v-row class="fill-height">
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text v-if="!notes"
              class="text-center">
            <v-progress-circular
              :size="32"
              :width="2"
              indeterminate />
          </v-card-text>
          <v-list v-else
              dense>
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

            <v-list-item v-if="Object.keys(notes).length == 0">
              <v-list-item-content>
                <small>You have made no notes</small>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-else
              v-for="(note, id) of notes" :key="id"
              @click="selected = id">
              <v-list-item-content>
                <v-list-item-title>{{ note.name }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="8">
        <div v-if="!note"
            class="text-center">
          <v-progress-circular
            :size="64"
            :width="4"
            color="primary"
            indeterminate />
        </div>
        <edit-note v-else
          :can-delete="!note.isNew"
          :loading="saving || deleting.loading"
          :value="note"
          @delete="deleting.dialog = true"
          @save="saveNote" />
      </v-col>
    </v-row>
    
    <v-dialog
      v-if="note"
      v-model="deleting.dialog"
      :persistent="deleting.loading"
      width="500">
      <v-card v-if="deleting.loading" class="text-center">
        <v-progress-circular
          class="ma-4"
          :size="32"
          :width="2"
          color="primary"
          indeterminate />
      </v-card>
      <v-card v-else>
        <v-card-title
          class="headline"
          primary-title>
          Delete '{{ note.name }}'?
        </v-card-title>

        <v-card-text class="pt-3 pb-0">
          This action cannot be undone!
        </v-card-text>

        <v-card-actions class="px-6">
          <v-spacer />

          <v-btn
            color="error"
            text small
            @click="deleteNote">
            I'm sure
          </v-btn>

          <v-btn
            color="primary"
            depressed
            @click="deleting.dialog = false">
            No, please!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import EditNote from '../../components/EditNote.vue'

  export default {
    components: {
      EditNote
    },
    data: () => ({
      notes: null,

      selected: null,
      note: null,
      
      saving: false,
      deleting: {
        dialog: false,
        loading: false
      }
    }),
    watch: {
      async selected(val) {
        if(val == null) {
          this.$router.push({ name: 'Notes', params: Object.assign(this.$route.params, { noteId: null }) });

          this.newNote();
          return;
        }
        
        this.note = null;

        let note = await this.$lb.Note.get({ id: val });

        if(note) {
          this.note = note;

          this.$router.push({ name: 'Notes', params: Object.assign(this.$route.params, { noteId: this.note.id }) });
        }else
          this.newNote();
      }
    },
    methods: {
      async reloadNotes(inPlaceReload) {
        if(!inPlaceReload) {
          this.notes = null;
        }

        let notes = await this.$lb.Note.find();

        this.notes = { };

        for(let note of notes) {
          this.notes[note.id] = note;
        }
      },

      newNote() {
        this.note = new (this.$lb.Note)({ type: 'note' });

        this.$router.push({ name: 'Notes', params: Object.assign(this.$route.params, { noteId: null }) });
      },
      async saveNote(note) {
        this.saving = true;

        this.$set(this.notes, note.id, note);

        await note.save();

        await this.reloadNotes(true);
        
        this.saving = false;
        
        if(this.$route.params.noteId != note.id)
          this.$router.push({ name: 'Notes', params: Object.assign(this.$route.params, { noteId: note.id }) });
      },
      async deleteNote() {
        this.deleting.loading = true;
        
        await this.note.delete();

        // Refresh the list
        await this.reloadNotes(true);

        this.deleting.dialog = false;

        this.newNote();
      }
    },
    mounted() {
      this.selected = this.$route.params.noteId;

      this.reloadNotes();
    }
  };
</script>