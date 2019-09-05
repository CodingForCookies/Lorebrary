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
        <v-list-item>
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

      <v-list>
        <template
          v-for="group in navigation">
          <v-subheader v-if="group.name"
            :key="group.name + '-title'">{{ group.name }}</v-subheader>
          <v-list-item-group :key="group.name + '-items'">
            <v-list-item
                v-for="item in group.items"
                :key="item.name"
                class="two-lines"
                link
                :to="{ name: item.route || item.name }"
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
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app
        class="px-4">

      <v-app-bar-nav-icon
        v-if="isSmall"
        @click.stop="navDrawer = !navDrawer" />

      <v-app-bar-nav-icon
        v-if="!isSmall"
        @click.stop="$store.state.window.miniDrawer = !$store.state.window.miniDrawer" />

      <v-spacer />

      <v-btn icon :to="{ name: 'Global Search' }">
        <v-icon>fas fa-search</v-icon>
      </v-btn>
      <v-btn icon :to="{ name: 'Global Notes' }">
        <v-icon>fas fa-sticky-note</v-icon>
      </v-btn>
      <v-btn icon :to="{ name: 'Account' }">
        <v-icon>fas fa-user</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
  import NewUniverse from '../../components/NewUniverse.vue';

  export default {
    components: { NewUniverse },
    data: () => ({
      navDrawer: null,

      navigation: [
        {
          items: [
            { icon: 'home', name: 'Dashboard' }
          ]
        }
      ]
    }),
    computed: {
      isSmall() {
        return this.$vuetify.breakpoint.xs || this.$vuetify.breakpoint.sm || this.$vuetify.breakpoint.md;
      }
    }
  };
</script>