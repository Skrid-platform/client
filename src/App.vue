<template>
  <div id="app">
    <header-component class="sticky" />
    <div class="main-content"><router-view /><!-- Contenu de la page --></div>
    <footer-component />
  </div>
</template>

<script setup>
import HeaderComponent from './components/layout/HeaderComponent.vue'
import FooterComponent from './components/layout/FooterComponent.vue'

import { onMounted } from 'vue'

defineOptions({
  name: 'App'
});

onMounted(() => {
  // Calcule la hauteur du navbar
  const navbarHeight = document.querySelector('.navbar').offsetHeight
  // Applique dynamiquement un padding-top au contenu pour qu'il ne soit pas masqué sous le navbar
  document.querySelector('.main-content').style.top = `${navbarHeight}px`
})
</script>

<style>
body {
  padding: 0;
  margin: 0;
}
nav {
  background-color: #006485;
}
.container-main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.main-content {
  display: block;
}
.sticky {
  position: sticky;
  top: 0;
  z-index: 1000;
}
</style>