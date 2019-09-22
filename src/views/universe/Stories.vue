<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" sm="8" offset-sm="2">
        <v-row>
          <v-hover class="story">
            <template v-slot="{ hover }">
              <v-sheet color="grey lighten-2"
                  width="150"
                  height="200"
                  :elevation="hover ? 6 : 1"
                  @click.stop="newStory = true">
                <v-row align-content="center" 
                    justify="center"
                    class="fill-height">
                  <v-icon large>fas fa-plus</v-icon>
                </v-row>
                <v-dialog
                  v-model="newStory"
                  width="500">
                  <edit-story @saved="onStoryCreated" />
                </v-dialog>
              </v-sheet>
            </template>
          </v-hover>
          <v-hover v-for="(story, i) in storyList" :key="i"
              class="story">
            <template v-slot="{ hover }">
              <v-sheet color="brown lighten-2" dark
                  width="150"
                  height="200"
                  :elevation="hover ? 6 : 1"
                  @click="$router.push({ name: 'Story', params: Object.assign($route.params, { storyId: story.id }) })">
                <v-row align-content="center" 
                    justify="center"
                    class="fill-height">
                  {{ story.title }}
                </v-row>
              </v-sheet>
            </template>
          </v-hover>
        </v-row>
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

<style>
  .story {
    margin: .5rem;
    cursor: pointer;
  }
</style>