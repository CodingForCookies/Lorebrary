<template>
  <v-app v-if="acknowledged != version" style="background-color:#37474f">
    <v-dialog persistent :value="true" width="500">
      <v-card>
        <v-card-title
          class="pb-0 headline"
          primary-title>
          {{ changelog.title }}
        </v-card-title>
        <div v-if="changelog.subtitle"
            class="mx-6 overline">
          {{ changelog.subtitle }}
        </div>

        <v-card-text v-if="changelog.text"
            class="mt-4 py-0">
          <p v-for="(paragraph, i) in changelog.text" :key="'text-' + i" v-html="paragraph"></p>
        </v-card-text>

        <v-card-text v-if="changelog.changes"
            class="mt-4 py-0">
          <strong>Changes</strong>

          <div v-for="(change, i) in changelog.changes.additions" :key="'additions-' + i"
            class="success--text">+ {{ change }}</div>
          <div v-for="(change, i) in changelog.changes.subtractions" :key="'subtractions-' + i"
            class="error--text">- {{ change }}</div>
        </v-card-text>

        <v-card-text v-if="changelog.bugs"
            class="mt-4 py-0">
          
          <strong>Bugs</strong>

          <div v-for="(change, i) in changelog.bugs.fixed" :key="'fixed-' + i"
            class="success--text">- {{ change }}</div>
          <div v-for="(change, i) in changelog.bugs.added" :key="'added-' + i"
            class="error--text">+ {{ change }}</div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn
            color="primary"
            text
            @click="acknowledgeVersion">
            Yay!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
  <div id="main-loader" v-else-if="$store.state.startup.is">
    <span class="loader"><span class="loader-inner"></span></span>
    <div id="text">
      <span v-for="(stage, i) in $store.state.startup.stages" :key="i"
        :class="'dot' + (stage.status ? ' ' + stage.status : '')"></span>
    </div>
  </div>

  <!-- We could put the Main.vue things, here, but we defer loading it so it doesn't need to worry about startup procedure logic. -->
  <div v-else>
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    data: () => ({
      acknowledged: localStorage.getItem("acknowledged"),
      version: process.env.VUE_APP_VERSION,
      changelog: null
    }),
    methods: {
      acknowledgeVersion() {
        localStorage.setItem("acknowledged", this.version);
        
        this.acknowledged = this.version;
      }
    },

    created() {
      this.changelog = require('./changelogs/' + this.version + '.json');
    },

    mounted() {
      // If we're running in an iframe, don't automatically start up. Allow the parent to init startup.
      
      try {
        this.$store.state.window.frame = window.self !== window.top;
      } catch (e) {
        this.$store.state.window.frame = true;
      }

      if(!this.$store.state.window.frame) {
        this.$store.dispatch('doStartup');
      }
    }
  };
</script>
