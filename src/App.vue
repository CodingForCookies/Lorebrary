<template>
  <div id="main-loader" v-if="$store.state.startup.is">
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
