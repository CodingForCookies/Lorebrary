<template>
    <v-card>
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

        <scroll-area style="max-height: 400px">
            <v-list class="pa-0">
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
                            two-line
                            :to="{ name: 'Overview', params: { universeId: universe.id } }">
                        <v-list-item-avatar
                                tile
                                size="32">
                            <v-icon>{{ $drivers[universe.driver].icon }}</v-icon>
                        </v-list-item-avatar>

                        <v-list-item-content>
                            <v-list-item-title class="mb-1">
                                {{ universe.name }}
                            </v-list-item-title>
                            <v-list-item-subtitle class="text--primary">by <b>You</b></v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </template>
            </v-list>
        </scroll-area>

        <v-divider />

        <v-btn
                block text tile
                @click.stop="newUniverse.dialog = true">
            Create a Universe
        </v-btn>

        <confirm-delete
                :name="deleteUniverse.obj ? deleteUniverse.obj.name : null"
                v-model="deleteUniverse.dialog"
                @delete="doDelete" />
    </v-card>
</template>

<script>
  import NewUniverse from './NewUniverse.vue';
    import ConfirmDelete from './ConfirmDelete.vue';

  export default {
    components: { NewUniverse, ConfirmDelete },
    data: () => ({
        newUniverse: {
            dialog: false,
            obj: null
        },
        deleteUniverse: {
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
      },

      async doDelete() {
          this.deleteUniverse.dialog = false;
      }
    }
  };
</script>
