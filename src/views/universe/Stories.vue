<template>
  <v-container>
    <v-overlay :value="!storyList">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <v-row v-if="!!storyList">
      <v-col cols="12">
        <v-card outlined>
          <v-btn
            block text tile
            @click.stop="newStory = true">
            Create a Story
          </v-btn>
          <v-dialog
            v-model="newStory"
            width="500">
            <edit-story @saved="onStoryCreated" />
          </v-dialog>
          <v-divider />

          <v-list class="pa-0">
            <v-list-item v-if="storyList.length == 0">
              <v-list-item-content class="text-center">
                <v-icon large>fas fa-skull-crossbones</v-icon>
                <div class="mt-4">
                  No Stories, yet!
                </div>
              </v-list-item-content>
            </v-list-item>

            <template v-else
                v-for="(story, i) in storyList">
              <v-divider v-if="i > 0" :key="'divider-' + i" />

              <v-list-item :key="'story-' + i"
                  three-line
                  :to="{ name: 'Story', params: Object.assign($route.params, { storyId: story.id }) }">
                <v-list-item-content>
                  <div class="overline">{{ story.tags.join(' | ') }}</div>
                  <v-list-item-title class="headline mb-1">{{ story.title }}</v-list-item-title>
                  <v-list-item-subtitle v-if="story.description">{{ story.description }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import EditStory from '../../components/EditStory.vue';

  export default {
    components: { EditStory },
    data: () => ({
      newStory: false,

      storyList: null
    }),
    methods: {
      // Close the new story dialog
      onStoryCreated(story) {
        this.newStory = false;

        this.storyList.push(story);
      }
    },
    async mounted() {
      this.storyList = await this.$lb.Story.find();
    }
  };
</script>