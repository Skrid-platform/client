<template>
  <div class="search-param">
    <!-- choose the collection in which to search -->
    <div class="collections-options">
      <label for="collections">Collection dans lesquelles rechercher : </label><br />
      <select id="collections" name="collections">
        <option
          @click="authors.selectedAuthorIndex = index"
          v-for="(author, index) in authors.listeAuthors"
          :key="index"
          :value="author"
        >
          {{ author }}
        </option>
      </select>
    </div>

    <hr />

    <h4 class="text-center">Sélectionnez le type de recherche</h4>

    <!-- Button to start research -->

    <div class="search-buttons">
      <button
        @click="exactSearchButtonHandler()"
        :class="selectedButton == 'exact' ? 'selected' : ''"
        class="btn text-white"
        type="button"
      >
        Recherche exacte
      </button>
      <button
        @click="pitchToleranteSearchButtonHandler()"
        :class="selectedButton == 'pitch' ? 'selected' : ''"
        class="btn text-white"
        type="button"
      >
        Recherche avec tolérance <br />
        sur la hauteur des notes
      </button>
      <button
        @click="rhythmToleranteSearchButtonHandler()"
        :class="selectedButton == 'rhythm' ? 'selected' : ''"
        class="btn text-white"
        type="button"
      >
        Recherche avec tolérance <br />
        sur le rythme
      </button>
      <!--<button id="libre" type="button" class="btn text-white" style="background-color: #7ab6e0;">Recherche exploratoire</button>-->
    </div>

    <button id="optionToggleButton" class="btn btn-outline-secondary" type="button" @click="toggleAdvancedOption()">
      Options avancées
    </button>

    <transition name="collapse">
      <div class="toggle-options" v-if="advancedOptionShow">
        <div class="general-options">
          <label class="tooltip-lb" id="pitch-lb">
            <input id="pitch-cb" type="checkbox" checked v-model="pitch_cb" />
            Hauteur des notes
          </label>
          <br />
          <label class="tooltip-lb" id="rhythm-lb">
            <input id="rhythm-cb" type="checkbox" checked v-model="rhythm_cb" />
            Rythme
          </label>
          <br />
          <label id="transpose-lb" class="tooltip-lb">
            <input id="transpose-cb" type="checkbox" v-model="transposition_cb" :disabled="!pitch_cb" />
            Autoriser les transpositions
          </label>
          <br />
          <label id="homothety-lb" class="tooltip-lb">
            <input id="homothety-cb" type="checkbox" v-model="homothety_cb" :disabled="!rhythm_cb" />
            Autoriser les variations de tempo
          </label>
          <br />
          <label id="incipit-lb" class="tooltip-lb">
            <input id="incipit-cb" type="checkbox" v-model="incipit_cb" />
            Chercher uniquement dans les incipits
          </label>
        </div>
        <div class="fuzzy-options">
          <label class="tooltip-lb" id="pitch-dist-lb">
            Tolérance de hauteur
            <input
              type="number"
              min="0"
              value="0"
              step="0.5"
              id="pitch-dist-select"
              class="nb-select"
              v-model="pitch_dist"
              :disabled="!pitch_cb"
            />
            <!-- <span class='tooltiptext'>Permet d'augmenter la tolérance sur la hauteur de note (en tons)</span> -->
          </label>

          <label class="tooltip-lb" id="duration-dist-lb">
            Facteur de durée
            <input
              type="number"
              min="1"
              value="1"
              step="0.125"
              id="duration-factor-select"
              class="nb-select-large"
              v-model="duration_factor"
              :disabled="!rhythm_cb"
            />
            <!-- <span class='tooltiptext'>Permet d'augmenter la tolérance sur la durée des notes (coefficient multiplicateur).</span> -->
          </label>

          <label class="tooltip-lb" id="sequencing-dist-lb">
            Écart de durée
            <input
              type="number"
              min="0"
              value="0"
              step="0.125"
              id="duration-gap-select"
              class="nb-select-large"
              v-model="duration_gap"
              :disabled="!rhythm_cb"
            />
            <!-- <span class='tooltiptext'>Permet de sauter des notes (en durée : 1 pour pleine, 0.5 pour ronde, 0.25 pour croche, ...)</span> -->
          </label>

          <label class="tooltip-lb" id="alpha-lb">
            Alpha
            <input type="number" min="0" max="100" value="0" step="5" id="alpha-select" class="nb-select" v-model="alpha" />
            %
            <!-- <span class='tooltiptext'>Permet de filtrer les résultats en retirant tous ceux qui ont un score inférieur à alpha.</span> -->
          </label>

          <hr />

          <button
            @click="
              toggleSelectedButton('');
              searchButtonHandler();
            "
            type="button"
            class="btn text-white send-button"
            id="send-button"
          >
            Recherche
          </button>
        </div>
      </div>
    </transition>
    <div ref="tooltipDiv" v-if="tooltipVisible" class="tooltip-div">
      <p>{{ tooltipText }}</p>
    </div>
  </div>
</template>

<script setup>
import StaveRepresentation from '@/lib/stave.js';
import { fetchSearchResults } from '@/services/dataBaseQueryServices';
import { createNotesQueryParam } from '@/services/dataManagerServices';
import { useAuthorsStore } from '@/stores/authorsStore.ts';
import { info_texts } from '@/constants/index.ts';

import { nextTick, onMounted, ref, watch } from 'vue';

defineOptions({
  name: 'SearchParam',
});
const emit = defineEmits(['receiveData', 'showPaginatedResult']);
const staveRepr = StaveRepresentation.getInstance();
const authors = useAuthorsStore();
const advancedOptionShow = ref(false); //flag for display advanced options or not
const selectedButton = ref(''); // to highlight the selected button ('exact', 'pitch', 'rhythm' or '' when no button is selected)
const tooltipVisible = ref(false);
const tooltipText = ref('');
const tooltipDiv = ref(null);

//======== Options for search buttons ========//
// checkbox
const pitch_cb = ref(true);
const rhythm_cb = ref(true);
const transposition_cb = ref(false);
const homothety_cb = ref(false);
const incipit_cb = ref(false);
// number inputs
const pitch_dist = ref(0);
const duration_factor = ref(1);
const duration_gap = ref(0);
const alpha = ref(0);

watch(pitch_cb, (newValue) => {
  // Enable or disable options that become irrelevant when unchecked.
  if (!newValue) {
    transposition_cb.value = false;
    // maybe this:
    // pitch_dist.value = 0; // Reset pitch distance to 0 when pitch is unchecked ??
  }
});

watch(rhythm_cb, (newValue) => {
  // Enable or disable options that become irrelevant when unchecked.
  if (!newValue) {
    homothety_cb.value = false;
    // maybe this:
    // duration_factor.value = 1; // Reset duration factor to 1 when rhythm is unchecked ??
    // duration_gap.value = 0; // Reset duration gap to 0 when rhythm is unchecked ??
  }
});

const toggleAdvancedOption = async () => {
  // Toggle the visibility of advanced options
  advancedOptionShow.value = !advancedOptionShow.value;
  // initialise the tooltip listener if advanced options are shown

  await nextTick();
  
  if (advancedOptionShow.value) {
    Object.keys(info_texts).forEach(id => {
      const elem = document.getElementById(id);
      if (!elem) {console.warn('Element not found:', id);return;}; // Check if the element exists
      elem.addEventListener('mousemove', (e) => showTooltip(e, info_texts[id]));
      elem.addEventListener('mouseout', () => hideTooltip());
    });
  } else {
    // remove the tooltip listener if advanced options are hidden
    Object.keys(info_texts).forEach(id => {
      const elem = document.getElementById(id);
      if (!elem) {console.warn('Element not found:', id);return;}; // Check if the element exists
      elem.removeEventListener('mousemove', (e) => showTooltip(e, info_texts[id]));
      elem.removeEventListener('mouseout', () => hideTooltip());
    });
  }
};

const toggleSelectedButton = (button) => {
  selectedButton.value = button;
};

const showTooltip = async (event, text) => {
  tooltipText.value = text;
  tooltipVisible.value = true;
  await nextTick();
  tooltipDiv.value.style.left = `${event.pageX + 20}px`;
  tooltipDiv.value.style.top = `${event.pageY - 30}px`; // ??? Apparament le header fait que le tooltip est un peu trop bas ???
};

const hideTooltip = () => {
  tooltipVisible.value = false;
};

function searchButtonHandler() {
  // Check that melody is not empty
  if (staveRepr.melody.length == 0) {
    alert('Stave is empty !\nPlease enter some notes to search for.');
    return;
  }

  if (!pitch_cb.value && !rhythm_cb.value) {
    alert(
      'You have ignored all settings (pitch, rhythm and contour).\nPlease select at least one.\nIf you want to browse the scores, check the collection page.',
    );
    return;
  }

  if (transposition_cb.value && staveRepr.melody.length == 1) {
    alert('For transposition and contour search, at least two notes are needed (because it is based on interval between notes).');
    return;
  }

  // show paginated-results component
  emit('showPaginatedResult');

  // Prepare the search parameters
  const notesQueryParam = createNotesQueryParam(staveRepr.melody, !pitch_cb.value, !rhythm_cb.value);

  const searchParams = {
    collection: authors.selectedAuthorName,
    notes: notesQueryParam,
    allow_transposition: transposition_cb.value,
    allow_homothety: homothety_cb.value,
    incipit_only: incipit_cb.value,
    pitch_distance: pitch_dist.value,
    duration_factor: duration_factor.value,
    duration_gap: duration_gap.value,
    alpha: alpha.value / 100, // convert to a value between 0 and 1
    contour_match: false,
  };

  fetchSearchResults(searchParams).then((results) => {
    emit('receiveData', results);
  });
}

function exactSearchButtonHandler() {
  // apply preset value for exact search
  pitch_cb.value = true;
  rhythm_cb.value = true;
  transposition_cb.value = false;
  homothety_cb.value = false;
  incipit_cb.value = false;
  pitch_dist.value = 0;
  duration_factor.value = 1;
  duration_gap.value = 0;
  alpha.value = 0;

  toggleSelectedButton('exact');

  searchButtonHandler();
}

function pitchToleranteSearchButtonHandler() {
  // apply preset value for tolérante pitch search
  pitch_cb.value = true;
  rhythm_cb.value = true;
  transposition_cb.value = true;
  homothety_cb.value = false;
  incipit_cb.value = false;
  pitch_dist.value = 3;
  duration_factor.value = 1.5;
  duration_gap.value = 0;
  alpha.value = 50;

  toggleSelectedButton('pitch');

  searchButtonHandler();
}

function rhythmToleranteSearchButtonHandler() {
  // apply preset value for rythm tolerante search
  pitch_cb.value = true;
  rhythm_cb.value = true;
  transposition_cb.value = true;
  homothety_cb.value = true;
  incipit_cb.value = false;
  pitch_dist.value = 1;
  duration_factor.value = 4;
  duration_gap.value = 0.0625;
  alpha.value = 50;

  toggleSelectedButton('rhythm');

  searchButtonHandler();
}

onMounted(() => {
  authors.loadAuthors();
});
</script>

<style scoped>
.search-param {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
}
.search-buttons {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
}
.search-buttons > button {
  background: #7ab6e0;
  color: white;
}
.search-buttons > button:hover,
.selected {
  background: #006485 !important;
}

.fuzzy-options {
  display: flex;
  flex-direction: column;
  justify-content: start;
}
#send-button {
  background: #006485;
  align-self: center;
}
#optionToggleButton {
  background: white;
}
#optionToggleButton:hover {
  background: #6c757d;
  color: white;
}

.nb-select {
  width: 50px;
}
.nb-select-large {
  width: 60px;
}
.toggle-options {
  align-self: center;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  max-width: 400px;
}

.tooltip-div {
  position: absolute;
  display: block;
  z-index: 0;
  color: black;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 3px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);
}

.tooltip-div p {
  margin: 0;
  padding: 10px;
  font-size: 12px;
  max-width: 300px;
}


.collapse-enter-active {
  overflow: hidden;
  animation: collapse 0.5s;
}
.collapse-leave-active {
  overflow: hidden;
  animation: collapse 0.5s reverse;
}
@keyframes collapse {
  0% {
    max-height: 0px;
  }
  100% {
    max-height: 400px;
  }
}
</style>
