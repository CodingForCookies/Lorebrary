<template>
  <v-container fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="6" md="5">
        <select-universe />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import SelectUniverse from '../../components/SelectUniverse.vue';

  export default {
    components: { SelectUniverse }
  };
</script>
