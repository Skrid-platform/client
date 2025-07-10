<template>
  <footer class="footer bg-light text-black border-top py-4">
    <!-- Bootstrap Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" />

    <div class="container-fluid">
      <!-- Permet d'occuper toute la largeur -->

      <div class="row d-flex justify-content-between">
        <!-- Section 2 : Liens utiles (collé à gauche) -->
        <div class="col-md-4 text-md-start px-5">
          <h5 class="fw-bold no-wrap">Liens utiles</h5>
          <ul class="list-unstyled">
            <li>
              <router-link to="/references" class="text-decoration-none no-wrap">Références et liens</router-link>
            </li>
            <li><router-link to="/plus" class="text-decoration-none no-wrap">En savoir plus</router-link></li>
            <li><router-link to="/help" class="text-decoration-none no-wrap">Guide et astuces</router-link></li>
          </ul>
        </div>

        <!-- Section 3 : Réseaux sociaux (collé à droite) -->
        <div class="col-md-4 text-md-end px-5">
          <h5 class="fw-bold no-wrap">Suivez-nous</h5>
          <a href="https://github.com/lasercata/SKRIDPlatform" class="text-black me-3">
            <i class="bi bi-github fs-4"></i>
          </a>
        </div>

        <!-- Section 1 : Logo & Texte (centré en bas) -->
        <div class="row">
          <div class="col-12 text-center">
            <h5 class="fw-bold no-wrap">The SKRID Platform</h5>
            <p>&copy; 2023-2024. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
  
<script setup>
import { RouterLink } from 'vue-router';

defineOptions({
  name: 'FooterComponent',
});
</script>
  
<style scoped>
.footer {
  padding: 1rem;
}
rooter-link {
  color: #006485 !important;
  text-decoration: none;
}
</style>