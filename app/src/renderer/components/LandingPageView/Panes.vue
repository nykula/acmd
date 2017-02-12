<template>
  <section class="panes">
    <div class="row">
      <panes-col></panes-col>
      <panes-col></panes-col>
    </div>
  </section>
</template>

<script>
import $ from 'jquery';
import PanesCol from './PanesCol';

export default {
  components: {
    PanesCol,
  },

  mounted() {
    $('.directory th').addClass('p-0');
    $('.directory th .btn').addClass('text-left');
    $('.directory td').addClass('py-0');

    $('.directory tbody td').addClass('border-top-0');

    $('.directory tbody').each(function enhanceTbody() {
      const rows = 10 - $(this).children().length;

      if (rows < 1) {
        return;
      }

      const height = `calc((2 * 1px + 2 * 0.3rem + 1.5rem) * ${rows})`;

      $('<tr />').css({ height }).appendTo(this);
    });

    $('.tabs .nav-link').addClass('px-2 py-0');
  },
};
</script>
