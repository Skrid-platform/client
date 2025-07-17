<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h2>{{ scoreData.title || 'Partition' }}</h2>
        <button class="close-button" @click="closeModal">×</button>
      </div>

      <div class="modal-body">
        <!-- Contrôles de lecture -->
        <div class="playback-controls">
          <button @click="togglePlayback" class="play-button">
            {{ playStatus }}
          </button>
          <button @click="stopPlayback" class="stop-button">Stop</button>
          <div class="tempo-control">
            <label>Tempo: {{ tempo }} BPM</label>
            <input type="range" min="60" max="200" v-model="tempo" @input="updateTempo" />
          </div>
        </div>

        <div class="score-details" v-if="scoreData.matches && scoreData.matches.length > 0">
          <!-- Affichage de la partition -->
          <div class="score-display">
            <div v-html="scoreSvg" class="svg-container" ref="svgContainer"></div>
          </div>
          <div class="results-details">
            <!-- Échelle de couleur -->
            <div class="color-scale">
              <h3>Échelle de satisfaction</h3>
              <div class="color-gradient">
                <div class="gradient-bar"></div>
                <div class="gradient-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <!-- Contrôles de sélection des résultats -->
            <div class="match-controls">
              <h3>Résultats de recherche</h3>
              <div class="match-list">
                <div v-for="(match, index) in scoreData.matches" :key="index" class="match-item">
                  <label>
                    <input type="checkbox" checked @click="toggleMatchHighlight(match)" />
                    Résultat {{ index + 1 }} ({{ Math.floor(match.overall_degree * 100) }}%)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { useVerovioStore } from '@/stores/verovioStore';
import { useAudioPlayer } from '@/composables/useAudioPlayer';
import { getGradientColor } from '@/services/colorService';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  scoreData: {
    type: Object,
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close']);

const verovio = useVerovioStore();
const scoreSvg = ref('');
const selectedMatches = ref([]);
const tempo = ref(120);
const svgContainer = ref(null);
const playStatus = computed(() => {
  if (isPlayingAudio.value) return 'Pause';
  if (isPausedAudio.value) return 'Reprendre';
  if (isStoppedAudio.value) return 'Jouer';
});


// Composable pour la gestion audio
const {
  playScore,
  resumeScore,
  pauseScore,
  stopScore,
  updateTempo: updateAudioTempo,
  isPlayingAudio,
  isPausedAudio,
  isStoppedAudio,
  setHighlightCallbacks,
} = useAudioPlayer();

// Charger la partition complète
const renderScore = async () => {
  // Rendre la partition avec Verovio
  await verovio.ensureTkInitialized();

  // Configuration pour affichage complet
  const options = {
    pageHeight: 60000, // show all the partition in one page with scroll
    pageWidth: 1600,
    scale: 40,
    adjustPageHeight: true, // permet à Verovio d'étendre la hauteur
  };

  verovio.tk.setOptions(options);
  verovio.tk.loadData(props.scoreData.meiXML);
  scoreSvg.value = verovio.tk.renderToSVG(1);

  // Appliquer le surlignage initial
  updateHighlighting();
};

// Mettre à jour le surlignage des notes
const updateHighlighting = async () => {
  await nextTick();

  // Effacer tous les surlignages existants
  clearHighlighting();
  await nextTick();

  // Appliquer le surlignage pour les résultats sélectionnés
  if (props.scoreData.matches) {
    selectedMatches.value.forEach((match) => {
      if (match.notes) {
        match.notes.forEach((note) => {
          const noteElement = svgContainer.value.querySelector(`#${note.id}`);
          if (noteElement) {
            const color = getGradientColor(note.note_deg);
            noteElement.setAttribute('fill', color);
          }
        });
      }
    });
  }
};

// Toggle match highlighting
const toggleMatchHighlight = (match) => {
  if (match.notes) {
    match.notes.forEach((note) => {
      const noteElement = svgContainer.value.querySelector(`#${note.id}`);
      if (noteElement) {
        if (noteElement.getAttribute('fill') === 'black') {
          const color = getGradientColor(note.note_deg);
          noteElement.setAttribute('fill', color);
        } else {
          noteElement.setAttribute('fill', 'black'); // Remove highlight
        }
      }
    });
  }
};

// Effacer tous les surlignages
const clearHighlighting = () => {
  const noteElements = svgContainer.value.querySelectorAll('[id^="note-"]');
  noteElements.forEach((element) => {
    element.setAttribute('fill', 'black');
  });
};

// Surligner une note pendant la lecture
const highlightCurrentNote = (noteId) => {
  // Effacer le surlignage précédent
  removePreviousHighlighting();

  // Surligner la note actuelle
  const currentNote = svgContainer.value.querySelector(`#${noteId}`);
  if (currentNote) {
    currentNote.classList.add('currently-playing');
  }
};

const removePreviousHighlighting = () => {
  const highlighted = svgContainer.value.querySelectorAll('.currently-playing');
  highlighted.forEach((el) => el.classList.remove('currently-playing'));
};

// Gestion de la lecture
const togglePlayback = async () => {
  if (isPlayingAudio.value) {
    pauseScore();
  } else if (isPausedAudio.value) {
    resumeScore();
  } else {
    await playScore(props.scoreData.meiXML, tempo.value);
  }
};

const stopPlayback = () => {
  stopScore();
  isPlayingAudio.value = false;

  // Effacer les surlignages de lecture
  const highlighted = svgContainer.value.querySelectorAll('.currently-playing');
  highlighted.forEach((el) => el.classList.remove('currently-playing'));
};

const updateTempo = () => {
  updateAudioTempo(tempo.value);
};

// Gestion de la modal
const closeModal = () => {
  stopPlayback();
  emit('close');
};

const handleOverlayClick = (event) => {
  if (event.target === event.currentTarget) {
    closeModal();
  }
};

// when the modal is opened, load the full score and set up watchers
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      selectedMatches.value = props.scoreData.matches || [];
      renderScore();
      document.getElementById('app').classList.add('stop-scroll');
    } else {
      stopPlayback();
      document.getElementById('app').classList.remove('stop-scroll');
    }
  }
);

// Configuration du callback pour le surlignage pendant la lecture
onMounted(() => {
  setHighlightCallbacks(highlightCurrentNote, removePreviousHighlighting);
});

onUnmounted(() => {
  stopPlayback();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #c0c0c0;
  flex-shrink: 0;
}

.modal-header h2 {
  flex: 1;
  text-align: center;
  font-size: 24px;
  margin: 0;
  color: #333;
}

.close-button {
  background: rgb(236, 95, 95);
  border-radius: 20%;
  font-size: 35px;
  cursor: pointer;
  color: black;
  font-weight: bold;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 5px;
  border: none;
}

.close-button:hover {
  color: #444;
}

.modal-content {
  background: white;
  border-radius: 10px;
  width: 90%;
  height: 90%;
  max-width: 1400px;
  max-height: 900px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
}

.playback-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.play-button,
.stop-button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.play-button {
  background: #28a745;
  color: white;
}

.play-button:hover {
  background: #218838;
}

.stop-button {
  background: #dc3545;
  color: white;
}

.stop-button:hover {
  background: #c82333;
}

.tempo-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tempo-control label {
  font-weight: bold;
  min-width: 100px;
}

.tempo-control input[type='range'] {
  width: 150px;
}

.score-details {
  position: sticky;
  display: flex;
  width: 100%;
}

.results-details {
  display: flex;
  flex-direction: column;
}

.color-scale {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.color-scale h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.color-gradient {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.gradient-bar {
  height: 20px;
  background: linear-gradient(to right, #ff0000, #d7d700, #00b300);
  border-radius: 10px;
  border: 2px solid #c0c0c0;
}

.gradient-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.match-controls {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.match-controls h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.match-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.match-item label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
}

.match-item input[type='checkbox'] {
  width: 16px;
  height: 16px;
}

.score-display {
  flex: 1;
  display: flex;
  justify-content: center;
  background: white;
  border: 1px solid #c0c0c0;
  border-radius: 8px;
  padding: 20px;
  overflow: auto;
}

.svg-container {
  max-width: 100%;
  height: auto;
}

.svg-container :deep(svg) {
  max-width: 100%;
  height: auto;
}

/* Style pour la note actuellement jouée */
.svg-container :deep(.currently-playing) {
  fill: #ff6b6b !important;
  stroke: #ff6b6b !important;
  stroke-width: 2px !important;
}

/* Animation pour la note jouée */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.svg-container :deep(.currently-playing) {
  animation: pulse 0.5s ease-in-out;
}
</style>
