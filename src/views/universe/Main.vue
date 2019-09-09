<template>
  <v-app>
    <v-navigation-drawer
      v-model="navDrawer"
      app
      overflow
      color="blue-grey darken-3"
      dark
      :mini-variant="!isSmall && $store.state.window.miniDrawer">
      <template v-if="!$store.state.window.frame">
        <v-list-item
            flat
            :to="{ name: 'Dashboard' }"
            exact
            :ripple="false">
            <template v-if="!(!isSmall && $store.state.window.miniDrawer)">
              <v-list-item-content class="text-center">
                <v-list-item-title class="title">
                    Lorebrary
                </v-list-item-title>
                <v-list-item-subtitle>
                    Build your world
                </v-list-item-subtitle>
              </v-list-item-content>
            </template>
            <template v-else>
              <v-list-item-icon>
                <div class="mx-auto">
                  <v-icon large>fas fa-book-open</v-icon>
                </div>
              </v-list-item-icon>
            </template>
        </v-list-item>
      </template>

      <v-fade-transition>
        <v-list v-if="universe">
          <v-list-item-group>
            <v-list-item
              v-for="item in navigation"
              :key="item.name"
              class="two-lines"
              link
              :to="{ name: item.route || item.name, params: { ...{ universe: universe.id }, ...(item.params || { }) } }"
              :exact="item.exact === undefined ? true : item.exact">
              <v-list-item-icon>
                <div class="mx-auto">
                  <v-icon>fas fa-{{ item.icon }}</v-icon>
                </div>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>{{ item.name }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-fade-transition>
    </v-navigation-drawer>

    <!-- Not sure if this should exist on large devices -->
    <v-app-bar
        v-if="isSmall"
        app
        :dark="this.$route.meta.darkAppBar ? this.$route.meta.darkAppBar : undefined"
        class="px-4">

      <v-app-bar-nav-icon
        v-if="isSmall"
        @click.stop="navDrawer = !navDrawer" />

      <v-app-bar-nav-icon
        v-if="!isSmall"
        @click.stop="$store.state.window.miniDrawer = !$store.state.window.miniDrawer" />

      <v-spacer />

      <!--<v-btn icon :to="{ name: 'Search' }">
        <v-icon>fas fa-search</v-icon>
      </v-btn>
      <v-btn icon :to="{ name: 'Notes' }">
        <v-icon>fas fa-sticky-note</v-icon>
      </v-btn>
      <v-btn icon :to="{ name: 'Account' }">
        <v-icon>fas fa-user</v-icon>
      </v-btn>-->

      <v-app-bar-nav-icon
        v-if="this.$route.meta.rightDrawer ? this.$route.meta.rightDrawer : undefined"
        v-model="$store.state.window.rightDrawer"
        @click.stop="$store.state.window.rightDrawer = !$store.state.window.rightDrawer" />
    </v-app-bar>

    <v-content v-if="!universe" class="my-4 text-center">
      <v-progress-circular
        :size="64"
        :width="4"
        color="primary"
        indeterminate />
    </v-content>
    <v-content v-else
        style="margin-bottom:40px">
      <router-view />
    </v-content>
    
    <app-footer />
  </v-app>
</template>

<script>
  import NewUniverse from '../../components/NewUniverse.vue';

  export default {
    components: { NewUniverse },
    data: () => ({
      navDrawer: null,

      navigation: [
        // { icon: 'home', name: 'Overview' },
        { icon: 'map', name: 'Atlas' },
        { icon: 'book', name: 'Codex', exact: false },
        // { icon: 'history', name: 'Timelines', exact: false },
        { icon: 'bookmark', name: 'Stories', exact: false },
        { icon: 'sticky-note', name: 'Notes', exact: false }
      ]
    }),
    computed: {
      isSmall() {
        return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm || this.$vuetify.breakpoint.md;
      },

      universe() {
        return this.$store.getters.universe;
      }
    },
    watch: {
      // Auto update the selected universe based on route parameters
      '$route.params.universe'(val) {
        if(!val) return;

        this.$store.state.universeSelected = val;
      },

      // Go to the overview page if the loaded universe changes
      '$store.getters.universe'(val) {
        if(!val) return;

        // Navigate to the new universe page if we aren't currently in a page relating to it
        if(this.$route.params.universe != val.id)
          this.$router.push({ name: 'Overview', params: { universe: val.id } });
      }
    },
    mounted() {
      this.$store.state.universeSelected = this.$route.params.universe;
    }
  };
</script>