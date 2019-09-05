<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex xs12 md7>
        <v-card outlined>
          <v-btn
            block text tile
            @click.stop="newUniverse = true">
            Create a Universe
          </v-btn>
          <v-dialog
            v-model="newUniverse"
            width="500">
            <new-universe @created="onUniverseCreated" />
          </v-dialog>

          <v-divider />

          <v-list>
            <v-list-item v-if="universeList.length == 0">
              <v-list-item-content class="text-center">
                <v-icon large>fas fa-skull-crossbones</v-icon>
                <div class="mt-4">
                  No Universes, yet!
                </div>
              </v-list-item-content>
            </v-list-item>

            <v-list-item v-else
                v-for="(universe, i) in universeList" :key="i"
                three-line
                :to="{ name: 'Overview', params: { universe: universe.id } }">
              <v-list-item-content>
                <v-list-item-title class="headline mb-1">{{ universe.name }}</v-list-item-title>
                <v-list-item-subtitle>Greyhound divisely hello coldly fonwderfully</v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-avatar
                tile
                size="56">
                <v-icon>{{ $drivers[universe.driver].icon }}</v-icon>
              </v-list-item-avatar>
            </v-list-item>
          </v-list>
        </v-card>
      </v-flex>
      <v-flex xs12 md5>
        <v-layout column>
          <v-flex v-for="(article, i) in news" :key="i">
            <v-card hover outlined @click="">
              <v-list-item three-line>
                <v-list-item-content>
                  <div class="overline mb-4">{{ article.category }}</div>
                  <v-list-item-title class="headline mb-1">{{ article.name }}</v-list-item-title>
                  <v-list-item-subtitle>Greyhound divisely hello coldly fonwderfully</v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-avatar
                  tile
                  size="80"
                  color="grey" />
              </v-list-item>
            </v-card>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import NewUniverse from '../../components/NewUniverse.vue';

  export default {
    components: { NewUniverse },
    data: () => ({
      news: [
        { category: 'Dev Log', title: 'August - Dev Log', text: 'Lorem ipsum wew lfjrouhgr gkitj gjrhf lgfh dljhfd kj hfdsa' },
        { category: 'Tutorial', title: 'July - Dev Log', text: 'Lorem ipsum wew lfjrouhgr gkitj gjrhf lgfh dljhfd kj hfdsa' }
      ],
      
      newUniverse: false
    }),
    computed: {
      universeList() {
        return this.$store.getters.universeList;
      }
    },
    methods: {
      // Close the new universe dialog and navigate to the overview page.
      onUniverseCreated() {
        this.newUniverse = false;
      }
    }
  };
</script>
