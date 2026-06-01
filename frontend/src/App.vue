<script setup>
  import Navbar from "./components/Navbar.vue"
  import Footer from "./components/Footer.vue"
</script>

<template>
  <div class="layout">
    <Navbar />
    <main class="content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<style scoped>
  .layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .content {
    flex: 1;
    padding: 1rem;
  }

  @media (min-width: 768px) {
    .content {
      padding: 2rem 4rem;
    }
  }
</style>
