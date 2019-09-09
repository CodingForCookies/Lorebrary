<template>
  <v-container>
    <v-row class="fill-height">
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text v-if="!articles"
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

            <v-list-item v-for="(note, id) of articles" :key="id"
              @click="selected = id">
              <v-list-item-content>
                <v-list-item-title>{{ note.name }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="8">
        <div v-if="!article"
            class="text-center">
          <v-progress-circular
            :size="64"
            :width="4"
            color="primary"
            indeterminate />
        </div>
        <edit-note v-else
          :can-delete="!article.isNew"
          :loading="saving || deleting.loading"
          :note="article"
          @delete="deleting.dialog = true"
          @save="saveNote" />
      </v-col>
    </v-row>
    
    <v-dialog
      v-if="article"
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
          Delete '{{ article.name }}'?
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
      articles: null,

      selected: null,
      article: null,
      
      saving: false,
      deleting: {
        dialog: false,
        loading: false
      }
    }),
    watch: {
      async selected(val) {
        if(val == null) {
          this.$router.replace({ name: 'Notes', params: { universe: this.$route.params.universe } });

          this.newNote();
          return;
        }
        
        this.article = null;

        let article = await this.$lb.Article.get({ id: val });

        if(article) {
          this.article = article;

          this.$router.replace({ name: 'Notes', params: { universe: this.$route.params.universe, noteId: val } });
        }else
          this.newNote();
      }
    },
    methods: {
      async reloadArticles(inPlaceReload) {
        if(!inPlaceReload) {
          this.articles = null;
        }

        let articles = await this.$lb.Article.find({ type: 'note' });

        this.articles = { };

        for(let article of articles) {
          this.articles[article.id] = article;
        }
      },

      newNote() {
        this.article = new (this.$lb.Article)({ type: 'note' });

        this.$router.replace({ name: 'Notes', params: { universe: this.$route.params.universe } });
      },
      async saveNote(article) {
        this.saving = true;

        this.$set(this.articles, article.id, article);

        await article.save();

        await this.reloadArticles(true);
        
        this.saving = false;
      },
      async deleteNote() {
        this.deleting.loading = true;
        
        await this.article.delete();

        // Refresh the list
        await this.reloadArticles(true);

        this.deleting.dialog = false;

        this.newNote();
      }
    },
    mounted() {
      this.selected = this.$route.params.noteId;

      this.reloadArticles();
    }
  };
</script>