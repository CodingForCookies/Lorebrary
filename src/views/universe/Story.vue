<template>
  <sidebar-page
      :loading="!chapter">
    <template v-slot:sidebar>
      <v-card-title v-if="story">
        {{ story.title }}
      </v-card-title>
      <v-card-text v-if="!chapters"
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
            <v-list-item-title>New Chapter</v-list-item-title>
          </v-list-item-content>
          <v-list-item-icon>
            <div class="mx-auto">
              <v-icon small>fas fa-plus</v-icon>
            </div>
          </v-list-item-icon>
        </v-list-item>

        <v-divider />

        <v-list-item v-if="Object.keys(chapters).length == 0">
          <v-list-item-content>
            <small>You have made no chapters</small>
          </v-list-item-content>
        </v-list-item>
        <draggable v-else
          v-model="story.chapters"
          handle=".handle">
          <v-list-item v-for="id of story.chapters" :key="id"
              @click="selected = id">
            <v-list-item-icon class="handle">
              <v-icon small class="ma-1">fas fa-align-justify</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ chapters[id].name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </draggable>
      </v-list>
    </template>
    
    <template v-slot:content>
      <fancy-editor
        ref="editor"
        class="pa-4"
        min-height="350"
        v-model="chapter"
        :editing="selected ? editing : true"
        @save="saveChapter"
        @delete="deleteChapter" />

      <v-btn v-if="selected"
          absolute
          top right
          min-width="60"
          min-height="60"
          dark depressed tile
          :ripple="false"
          @click="editing = !editing">
        <v-icon>fas fa-{{ editing ? 'eye' : 'pencil-alt' }}</v-icon>
      </v-btn>
    </template>
  </sidebar-page>
</template>

<script>
  import SidebarPage from '../../components/SidebarPage.vue';
  import FancyEditor from '../../components/FancyEditor.vue';

  import draggable from 'vuedraggable'

  export default {
    components: {
      SidebarPage, FancyEditor, draggable
    },
    data: () => ({
      story: null,

      chapters: null,

      selected: null,
      chapter: null,

      editing: false,
      saving: false
    }),
    watch: {
      async 'story.chapters'(val) {
        await this.story.save();
      },
      async selected(val) {
        if(!val) {
          this.newChapter();
          return;
        }
      
        if(this.chapter && this.chapter.id == val) return;

        this.loadChapter(val);
      }
    },
    methods: {
      async reloadChapters(inPlaceReload) {
        if(!inPlaceReload) {
          this.chapters = null;
        }

        let chapters = await this.$lb.Chapter.find({
          story: this.$route.params.storyId
        });

        this.chapters = { };

        for(let chapter of chapters) {
          this.chapters[chapter.id] = chapter;

          // If a chapter got orphaned, somehow, append it
          if(!this.story.chapters.includes(chapter.id))
            this.story.chapters.push(chapter.id);
        }
      },

      toggleEditing(e) {
        this.editing = !this.editing;

        // Doesn't always work, but it's fine.
        this.$nextTick(() => {
          e.target.parentElement.parentElement.blur();
        });
      },

      newChapter() {
        this.chapter = new (this.$lb.Chapter)({ story: this.$route.params.storyId });

        this.selected = null;
        
        this.$router.push({ name: 'Story', params: Object.assign(this.$route.params, { chapterId: null }) });
      },
      async loadChapter(id) {
        this.chapter = null;

        this.selected = id;

        this.chapter = await this.$lb.Chapter.get({ story: this.story.id, id });

        if(this.chapter) {
          this.$router.push({ name: 'Story', params: Object.assign(this.$route.params, { chapterId: this.chapter.id }) });
        }else{
          this.newChapter();
        }
      },
      async saveChapter({ cb }) {
        await this.chapter.save();

        // Refresh the list
        // TODO: only refresh when adding. We do this for now so that titles will update correctly.
        await this.reloadChapters(true);

        this.selected = this.chapter.id;
        
        this.$router.replace({ name: 'Story', params: Object.assign(this.$route.params, { chapterId: this.chapter.id }) });

        cb();
      },
      async deleteChapter({ cb }) {
        await this.chapter.delete();

        // Refresh the list
        await this.reloadChapters(true);

        this.newChapter();

        cb();
      }
    },
    async mounted() {
      this.story = await this.$lb.Story.get({ id: this.$route.params.storyId });

      this.reloadChapters();
      
      this.selected = this.$route.params.chapterId;
    }
  };
</script>