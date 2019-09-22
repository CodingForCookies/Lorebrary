<template>
  <v-container fluid fill-height no-gutters class="pa-0">
    <v-row
        no-gutters
        class="fill-height">
      <v-col cols="12" md="4" lg="3">
        <v-card dark flat tile outlined color="blue-grey darken-4" class="fill-height sidebar-list">
          <slot name="sidebar" />
        </v-card>
      </v-col>
      <v-col v-if="loading"
          cols="12" md="8" lg="9">
        <v-row align="center" justify="center" class="fill-height">
          <v-progress-circular
            :size="64"
            :width="4"
            color="primary"
            indeterminate />
        </v-row>
      </v-col>
      <v-col v-else
        cols="12" md="8" :lg="hasRightbar ? 6 : 9">
        <v-card light flat tile class="fill-height">
          <v-col class="fill-height">
            <slot name="content" />
          </v-col>
        </v-card>
      </v-col>
      <template v-if="hasRightbar && !loading">
        <v-navigation-drawer
          v-model="$store.state.window.rightDrawer"
          absolute right
          temporary>
          <slot name="rightbar" />
        </v-navigation-drawer>
        <v-col lg="3" class="d-none d-lg-block">
          <v-card flat tile :color="$vuetify.theme.dark ? 'blue-grey darken-4' : 'rgba(0, 0, 0, .07)'" class="fill-height">
            <slot name="rightbar" />
          </v-card>
        </v-col>
      </template>
    </v-row>
    <slot />
  </v-container>
</template>

<script>
  export default {
    props: ['loading', 'rightbar'],
    computed: {
      hasRightbar() {
        return this.rightbar === true;
      }
    }
  }
</script>

<style>
  .sidebar-list {
    color: #FFF !important;
  }

  .sidebar-list .v-tabs > .v-tabs-bar {
    background-color: #202a2e !important;

    border-bottom: 1px solid rgba(0, 0, 0, .1);
  }

  .sidebar-list .v-treeview > .v-treeview-node--leaf > .v-treeview-node__root {
    color: #FFF !important;
  }

  .sidebar-list .v-treeview .v-treeview-node--active::before {
    background-color: #FFF !important;
  }

  .sidebar-list .v-treeview .v-treeview-node--active .v-treeview-node__label {
    color: #FFF !important;
  }

  .sidebar-list .v-treeview-node__root.v-treeview-node--active .v-treeview-node__content .v-icon {
    color: #FFF;
  }
</style>