<template>
  <v-dialog
      :value="true"
      width="500"
      scrollable
      persistent>
    <select-universe />
  </v-dialog>
</template>

<script>
  import SelectUniverse from '../../components/SelectUniverse.vue';

  export default {
    components: { SelectUniverse }
  };
</script>
