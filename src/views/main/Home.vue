<template>
  <v-container fill-height>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="6" md="5" lg="4">
        <select-universe />
      </v-col>
    </v-row>

    <v-btn
        absolute
        top right
        min-width="60"
        min-height="60"
        dark depressed tile
        :ripple="false">
      <v-icon>fas fa-user</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
  import SelectUniverse from '../../components/SelectUniverse.vue';

  export default {
    components: { SelectUniverse }
  };
</script>
