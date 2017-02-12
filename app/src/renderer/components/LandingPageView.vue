<template>
  <div class="container">
    <menu-bar></menu-bar><hr />
    <toolbar></toolbar><hr />
    <drives></drives><hr />
    <panes></panes>
    <prompt></prompt>
    <actions></actions>
  </div>
</template>

<script>
import $ from 'jquery';
import MenuBar from './LandingPageView/MenuBar';
import Toolbar from './LandingPageView/Toolbar';
import Drives from './LandingPageView/Drives';
import Panes from './LandingPageView/Panes';
import Prompt from './LandingPageView/Prompt';
import Actions from './LandingPageView/Actions';

export default {
  components: {
    MenuBar,
    Toolbar,
    Drives,
    Panes,
    Prompt,
    Actions,
  },

  name: 'landing-page',

  mounted() {
    $('hr').addClass('my-0');

    $('.btn-link').hover(function handleMouseenter() {
      $(this).addClass('btn-secondary').removeClass('btn-link');
    }, function handleMouseleave() {
      $(this).removeClass('btn-secondary').addClass('btn-link');
    });
  },
};
</script>

<style>
.pipe {
  color: #ddd;
}
</style>
