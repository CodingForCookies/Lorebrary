<template>
    <v-card tile>
        <v-dialog
                v-model="newUniverse.dialog"
                width="500"
                scrollable>
            <new-universe
                v-model="newUniverse.obj"
                @created="onUniverseCreated" />
        </v-dialog>
        
        <v-card-title>
            <div class="headline mx-auto">Select a Universe</div>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-0" style="max-height:300px">
            <v-list>
                <v-list-item v-if="universeList.length == 0">
                    <v-list-item-content class="text-center">
                        <v-icon large>fas fa-skull-crossbones</v-icon>
                        <div class="mt-4">
                            No Universes, yet!
                        </div>
                    </v-list-item-content>
                </v-list-item>

                <template v-else
                        v-for="(universe, i) in universeList">
                    <v-divider v-if="i > 0" :key="'divider-' + i" />

                    <v-list-item :key="'universe-' + i"
                            three-line
                            :to="{ name: 'Overview', params: { universeId: universe.id } }">
                        <v-list-item-content>
                            <v-list-item-title class="headline mb-1">{{ universe.name }}</v-list-item-title>
                            <v-list-item-subtitle>{{ universe.description || 'No description provided... :(' }}</v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-avatar
                                tile
                                size="56">
                            <v-icon>{{ $drivers[universe.driver].icon }}</v-icon>
                        </v-list-item-avatar>
                    </v-list-item>
                </template>
            </v-list>
        </v-card-text>

        <v-divider />

        <v-btn
                block text tile
                @click.stop="newUniverse.dialog = true">
            Create a Universe
        </v-btn>
    </v-card>
</template>

<script>
  import NewUniverse from './NewUniverse.vue';

  export default {
    components: { NewUniverse },
    data: () => ({
        newUniverse: {
            dialog: false,
            obj: null
        }
    }),
    computed: {
      universeList() {
        return this.$store.getters.universeList;
      }
    },
    watch: {
        'newUniverse.dialog'(val) {
            if(val) {
                this.newUniverse.obj = new (this.$lb.Universe)();
            }
        }
    },
    methods: {
      // Close the new universe dialog and navigate to the overview page.
      onUniverseCreated() {
        this.newUniverse.dialog = false;
      }
    }
  };
</script>
