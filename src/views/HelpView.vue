<template>
  <div>
    <div class="searchbar-box">
      <h1 class="searchbar-title">Guide et astuces</h1>
    </div>
    <div class="container my-5 d-flex justify-content-center">
      <div class="card shadow-sm p-5 bg-light">
        <h2 class="fw-bold text-center mb-4" style="color: #006485">Guide d'utilisation du Piano Virtuel</h2>
        <p class="text-muted text-center">Apprenez à utiliser le piano et les différentes options de recherche sur le site.</p>

        <!-- Section 1 : Introduction au piano -->
        <div class="card mb-4">
          <div class="card-body">
            <h4 class="fw-bold d-flex justify-content-start" style="color: #006485">🎹 Utiliser le piano virtuel</h4>
            <hr />
            <br />
            <p>Le piano interactif vous permet de jouer des notes en cliquant dessus ou via votre clavier.</p>
            <p>
              En fonction de la durée de l'appui (<em>touche ordinateur</em>), la figure de note varie : "croche, noire,
              blanche...".
            </p>
            <p>
              *<em
                >Cliquer sur une note avec votre souris est tout à fait possible, mais la figure de note sera moins précise <br />
                qu'avec le clavier. Il est donc conseillé d'utiliser les options avancées "figures de notes" afin d'ajuster votre
                recherche.</em
              >
            </p>
            <br />
            <div class="card mx-auto" style="width: 50rem; border: none">
              <img id="mobileIMG" src="/images/1.svg" class="img-fluid rounded mx-auto d-block" alt="Interface du piano" />
            </div>
            <br />
            <div class="card mx-auto" style="width: 50rem; border: none">
              <img id="mobileIMG" src="/images/2.svg" class="img-fluid rounded mx-auto d-block" alt="Interface du piano" />
            </div>
            <br />
            <hr />
            <p>L'option "touches" permet quant à elle d'afficher ou non les notes et touches du clavier associées.</p>
            <br />
            <div class="card mx-auto" style="width: 50rem; border: none">
              <img id="mobileIMG" src="/images/3.svg" class="img-fluid rounded mx-auto d-block" alt="Interface du piano" />
            </div>
          </div>
        </div>

        <!-- Section 2 : Effectuer une recherche -->
        <div class="card mb-4">
          <div class="card-body">
            <h4 class="fw-bold" style="color: #006485">🔍 Effectuer une recherche</h4>
            <hr />
            <p>Vous pouvez rechercher des partitions en utilisant des filtres/options et votre mélodie.</p>
            <p>
              Votre mélodie et/ou suite de notes, que nous nommerons <em>pattern</em>, <br />
              sera affichée sur la portée ci-dessous.
            </p>
            <div class="card mx-auto" style="width: 50rem; border: none">
              <img id="mobileIMG" src="/images/4.svg" class="img-fluid rounded mx-auto d-block" alt="Interface du piano" />
            </div>
            <br />
            <p>Vous retrouvez 3 boutons ci-dessus :</p>
            <ul>
              <li><strong>1</strong> : supprime toutes vos notes.</li>
              <li><strong>2</strong> : supprime seulement la dernière note.</li>
              <li><strong>3</strong> : entendre la mélodie renseignée (activez le son de votre ordinateur).</li>
            </ul>
          </div>
        </div>

        <!-- Section 3 : Comprendre les options -->
        <div class="card mb-4">
          <div class="card-body">
            <h4 class="fw-bold" style="color: #006485">⚙️ Comprendre les options</h4>
            <hr />
            <p>Chaque option vous permet d'affiner vos résultats et d'effectuer une recherche approchée.</p>
            <p>
              Une collection est automatiquement sélectionnée, vous pouvez la changer directement dans le petit menu déroulant.
            </p>
            <p>
              Enfin, une fois vos notes, figures et la collection choisies, vous allez pouvoir sélectionner un mode de recherche
              <br />
              parmi les 3 suivants :
            </p>
            <br />
            <ul>
              <li><strong>Mode recherche exacte</strong> : Une recherche pour un résultat exact.</li>
              <br />
              <li>
                <strong>Mode recherche mélodique approchée</strong> : Une recherche approchée sur la hauteur des notes. <br />Une
                tolérance légère sur leur durée peut être incluse.
              </li>
              <br />
              <li>
                <strong>Mode recherche rythmique approchée</strong> : Une recherche approximative sur la durée des notes.
                <br />Certaines figures de notes peuvent s'intercaler entre les notes recherchées.
              </li>
            </ul>
            <div class="card mx-auto" style="width: 50rem; border: none">
              <img id="mobileIMG" src="/images/5.svg" class="img-fluid rounded mx-auto d-block" alt="Interface du piano" />
            </div>
            <hr />
            <p>Si vous cliquez sur un mode, la recherche se lance directement.</p>
            <hr />
            <br />
            <div class="card mx-auto" style="width: 50rem; border: none">
              <img id="mobileIMG" src="/images/6.svg" class="img-fluid rounded mx-auto d-block" alt="Interface du piano" />
            </div>
            <br />
            <div class="card mx-auto" style="width: 50rem; border: none">
              <p>
                <strong>Hauteur des notes :</strong> Permet de prendre en compte / ignorer la hauteur des notes.<br />
                <strong>Rythme :</strong> Permet de prendre en compte / ignorer le rythme (la durée) des notes.<br />
                <strong>Transposition :</strong> Permet d'obtenir les partitions dont la hauteur des notes de la mélodie est
                décalée.
              </p>
              <hr />
              <p>
                <strong>Tolérance de hauteur :</strong> Permet d'augmenter la tolérance sur la hauteur des notes (en tons) ou sur
                les intervalles (si transposition est cochée).<br />
                <strong>Facteur de durée :</strong> Permet d'augmenter la tolérance sur la durée des notes (coefficient
                multiplicateur).<br />
                <strong>Écart de durée :</strong> Permet de sauter des notes (en durée : 1 pour pleine, 0.5 pour ronde, 0.25 pour
                croche, ...).<br />
                <strong>Alpha :</strong> Permet de filtrer les résultats en retirant tous ceux qui ont un score inférieur à
                alpha.<br />
              </p>
            </div>
          </div>
        </div>

        <!-- Section 4 : Aide supplémentaire -->
        <div class="card-body d-flex flex-row gap-2">
          <h4 class="fw-bold" style="color: #006485">Effectuer une recherche <i class="bi bi-arrow-right"></i></h4>
          <button class="btn text-white" style="background-color: #006485">
            <router-link class="nav-link" to="/searchInterface">Rechercher un motif</router-link>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineOptions({
  name: 'HelpView',
});
</script>

<style scoped></style>
