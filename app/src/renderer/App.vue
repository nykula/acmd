<template>
  <div id="#app">
    <landing-page></landing-page>
  </div>
</template>

<script>
  import LandingPage from 'components/LandingPageView';

  export default {
    components: {
      LandingPage,
    },
  };
</script>

<style>
  html,
  body { height: 100%; }

  body {
    background:
      radial-gradient(
        ellipse at center,
        rgba(255, 255, 255, 1) 0%,
        rgba(229, 229, 229, .85) 100%
      );
    background-position: center;
  }

  /* Consistent compactness */

  html {
    font-size: 0.875rem;
  }

  .btn-sm,
  .btn-group-sm .btn {
    font-size: 1rem;
    overflow: hidden;
    padding-bottom: 0.1875rem;
    padding-top: 0.1875rem;
  }
</style>
