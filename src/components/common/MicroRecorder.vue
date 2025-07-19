<template>
  <div class="wrapper">
    <button
      id="recording-circle"
      class="btn btn-outline-secondary btn-lg rounded-circle"
      :class="{ 'spinner-grow': micRecorder.is_recording.value }"
      disabled
    >
      <i class="bi bi-mic-fill"></i>
    </button>
    <hr />
    <!-- Section d'enregistrement audio -->
    <div id="styleCardRecorder" class="card-body recorder-container d-flex flex-column text-center">
      <button
        type="button"
        class="btn btn-info text-white"
        v-if="micRecorder.is_recording.value"
        @click="stopRecording()"
        id="stop_recording"
      >
        Arrêter l'enregistrement
      </button>
      <button v-else @click="startRecording()" type="button" class="btn btn-info text-white">Démarrer l'enregistrement</button>

      <!-- <div id="rec-indicator" class="inactive text-secondary" style="margin-top:10px;">Prêt à enregistrer</div> -->

      <a
        v-if="micRecorder.last_url.value"
        id="download-link"
        :href="micRecorder.last_url.value"
        target="_blank"
        rel="noopener noreferrer"
        >Télécharger l'enregistrement (.mp3)</a
      >
    </div>
  </div>
</template>

<script setup>
import StaveRepresentation from '@/lib/stave.js';
import MicroRecorder from '@/lib/mic_recorder.js';

import { onMounted, ref, watch } from 'vue';

defineOptions({
  name: 'MicroRecorder',
});

const micRecorder = MicroRecorder.getInstance();

/**
 * Starts recording audio from the microphone
 */
function startRecording() {
  try {
    console.log('Starting recording');
    micRecorder.startRecording();
  } catch (err) {
    console.error('Microphone access error:', err);
    return;
  }

  console.log('Recording processing...');
}

/**
 * Stops recording audio
 */
function stopRecording() {
  console.log('Stopping recording');
  micRecorder.stopRecording();
}

/**
 * Toggles the recording using the current state to determine the action
 */
function toggleRecording() {
  if (micRecorder.is_recording.value) {
    stopRecording();
  } else {
    startRecording();
  }
}

/**
 * Manages events associated to key presses.
 * Only to start/stop recording using space.
 * @param {KeyboardEvent} event - The keyboard event
 */
function keyListener(event) {
  //---Ignore repeat key for all the following
  if (event.repeat) return;

  // Toggle recording with space
  if (event.type == 'keydown' && event.key == ' ') {
    event.preventDefault(); // prevent scrolling
    toggleRecording();
  }
}

// Init
onMounted(() => {
  document.addEventListener('keydown', keyListener);
  document.addEventListener('keyup', keyListener);
});
</script>

<style scoped>
.wrapper {
  padding: 35px 40px;
  border-radius: 20px;
  text-align: center;
}

.wrapper header {
  display: flex;
  color: #b2b2b2;
  align-items: center;
  justify-content: space-between;
}

.results-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.music-score-box {
  width: 180px;
  height: 250px;
  background-color: #e6f2f8;
  border-radius: 10px;
  border: 2px solid #20aabd;
  padding: 10px;
  margin: 5px;
  word-wrap: break-word;
  overflow-x: hidden;
  overflow-y: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
.music-score-box:hover {
  cursor: pointer;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.3);
  background-color: #dceaf1;
}
.music-score-box svg {
  max-width: 100%;
  max-height: 100%;
}
.score-preview {
  text-decoration: none;
  color: #000;
  padding: 15px;
}
.score_title {
  margin-left: 8px;
  margin-top: 10px;
  width: 180px;
}
.score_author {
  font-size: 16px;
  margin-left: 8px;
}

.nb-select {
  width: 50px;
}
.nb-select-large {
  width: 60px;
}

.intervals-cb {
  display: grid;
  float: right;
}

.tooltip-lb {
  position: relative;
  display: inline-block;
}
.tooltip-lb .tooltiptext {
  visibility: hidden;
  width: 150px;
  background: #18767ed0;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px;

  position: absolute;
  z-index: 1;
}
.tooltip-lb:hover .tooltiptext {
  visibility: visible;
}

/* tooltip + alt for information button with hover */
/* renommer la classe pour éviter les conflits */
.tooltip-lb-alt {
  position: relative;
  display: inline-block;
}
.tooltip-lb-alt .tooltiptext {
  visibility: hidden;
  width: 150px;
  background: #18767ed0;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px;

  position: absolute;
  z-index: 1;
}
.tooltip-lb-alt:hover .tooltiptext {
  visibility: visible;
}

.info-note {
  background: cornsilk;
  border: 1px solid black;
  border-radius: 5px;
  padding: 5px;
  position: absolute;
}

#recording-circle {
  width: 6rem;
  height: 6rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

button {
  background: #7ab6e0;
}
.bt-not-recording {
  background-color: #006485;
  color: white;
}
#stop_recording {
  background: red;
}

#download-link {
  margin: 10px;
}

#styleCardRecorder {
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 5px;
  padding: 10px;
}
</style>
