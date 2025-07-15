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
            {{ isPlaying ? 'Pause' : 'Play' }}
          </button>
          <button @click="stopPlayback" class="stop-button">Stop</button>
          <div class="tempo-control">
            <label>Tempo: {{ tempo }} BPM</label>
            <input 
              type="range" 
              min="60" 
              max="200" 
              v-model="tempo" 
              @input="updateTempo"
            >
          </div>
        </div>

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
        <div class="match-controls" v-if="scoreData.matches && scoreData.matches.length > 0">
          <h3>Résultats de recherche</h3>
          <div class="match-list">
            <div 
              v-for="(match, index) in scoreData.matches" 
              :key="index"
              class="match-item"
            >
              <label>
                <input 
                  type="checkbox" 
                  v-model="selectedMatches" 
                  :value="index"
                  @change="updateHighlighting"
                >
                Résultat {{ index + 1 }} ({{ Math.floor(match.overall_degree * 100) }}%)
              </label>
            </div>
          </div>
        </div>

        <!-- Affichage de la partition -->
        <div class="score-display" ref="scoreContainer">
          <div v-html="scoreSvg" class="svg-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useVerovioStore } from '@/stores/verovioStore';
import { fetchMeiFileByFileName } from '@/services/dataBaseQueryServices';
import { extractTitleFromMeiXML } from '@/services/dataManagerServices';
import { useAudioPlayer } from '@/composables/useAudioPlayer';
import { getGradientColor } from '@/services/colorService';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  scoreData: {
    type: Object,
    required: true
  },
  authorName: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close']);

const verovio = useVerovioStore();
const scoreSvg = ref('');
const selectedMatches = ref([]);
const tempo = ref(120);
const isPlaying = ref(false);
const currentMeiXML = ref('');
const scoreContainer = ref(null);

// Composable pour la gestion audio
const { 
  playScore, 
  pauseScore, 
  stopScore, 
  updateTempo: updateAudioTempo,
  isPlayingAudio,
  currentNoteIndex,
  setHighlightCallback
} = useAudioPlayer();

const isPlayingComputed = computed(() => isPlayingAudio.value);

// Charger la partition complète
const loadFullScore = async () => {
  if (!props.scoreData.source) return;
  
  try {
    const meiXML = await fetchMeiFileByFileName(props.scoreData.source, props.authorName);
    currentMeiXML.value = meiXML;
    
    // Extraire le titre
    const title = extractTitleFromMeiXML(meiXML);
    if (title) {
      props.scoreData.title = title;
    }
    
    // Rendre la partition avec Verovio
    await verovio.ensureTkInitialized();
    
    // Configuration pour affichage complet
    const options = {
      pageHeight: 2100,
      pageWidth: 1600,
      scale: 40,
      adjustPageHeight: true,
      breaks: 'auto'
    };
    
    verovio.tk.setOptions(options);
    verovio.tk.loadData(meiXML);
    scoreSvg.value = verovio.tk.renderToSVG(1);
    
    // Initialiser la sélection avec tous les résultats
    if (props.scoreData.matches) {
      selectedMatches.value = props.scoreData.matches.map((_, index) => index);
    }
    
    // Appliquer le surlignage initial
    await nextTick();
    updateHighlighting();
    
  } catch (error) {
    console.error('Erreur lors du chargement de la partition:', error);
  }
};

// Mettre à jour le surlignage des notes
const updateHighlighting = async () => {
  await nextTick();
  
  // Effacer tous les surlignages existants
  clearHighlighting();
  
  // Appliquer le surlignage pour les résultats sélectionnés
  if (props.scoreData.matches) {
    selectedMatches.value.forEach(matchIndex => {
      const match = props.scoreData.matches[matchIndex];
      if (match && match.notes) {
        match.notes.forEach(note => {
          const noteElement = document.getElementById(note.id);
          if (noteElement) {
            const color = getGradientColor(note.note_deg);
            noteElement.setAttribute('fill', color);
          }
        });
      }
    });
  }
};

// Effacer tous les surlignages
const clearHighlighting = () => {
  const noteElements = document.querySelectorAll('[id^="note-"]');
  noteElements.forEach(element => {
    element.setAttribute('fill', 'black');
  });
};

// Surligner une note pendant la lecture
const highlightCurrentNote = (noteId) => {
  // Effacer le surlignage précédent
  const prevHighlighted = document.querySelectorAll('.currently-playing');
  prevHighlighted.forEach(el => el.classList.remove('currently-playing'));
  
  // Surligner la note actuelle
  const currentNote = document.getElementById(noteId);
  if (currentNote) {
    currentNote.classList.add('currently-playing');
  }
};

// Gestion de la lecture
const togglePlayback = async () => {
  if (isPlaying.value) {
    pauseScore();
  } else {
    if (currentMeiXML.value) {
      await playScore(currentMeiXML.value, tempo.value);
    }
  }
  isPlaying.value = !isPlaying.value;
};

const stopPlayback = () => {
  stopScore();
  isPlaying.value = false;
  
  // Effacer les surlignages de lecture
  const highlighted = document.querySelectorAll('.currently-playing');
  highlighted.forEach(el => el.classList.remove('currently-playing'));
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

// Watchers
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadFullScore();
  } else {
    stopPlayback();
  }
});

watch(isPlayingComputed, (newVal) => {
  isPlaying.value = newVal;
});

// Configuration du callback pour le surlignage pendant la lecture
onMounted(() => {
  setHighlightCallback(highlightCurrentNote);
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

.modal-content {
  background: white;
  border-radius: 10px;
  width: 95%;
  height: 95%;
  max-width: 1400px;
  max-height: 900px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #333;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.play-button, .stop-button {
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

.tempo-control input[type="range"] {
  width: 150px;
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
  border: 1px solid #ccc;
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

.match-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.score-display {
  flex: 1;
  display: flex;
  justify-content: center;
  background: white;
  border: 1px solid #ddd;
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
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.svg-container :deep(.currently-playing) {
  animation: pulse 0.5s ease-in-out;
}
</style>
