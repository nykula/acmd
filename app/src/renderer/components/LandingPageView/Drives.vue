<template>
  <section class="drives">
    <div class="row">
      <drives-col></drives-col>
      <drives-col></drives-col>
    </div>
  </section>
</template>

<script>
import DrivesCol from './DrivesCol';

export default {
  components: {
    DrivesCol,
  },
};
</script>
