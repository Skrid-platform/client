<template>
  <div class="wrapper">
    <button id="spinner-bar" class="btn btn-outline-secondary btn-lg rounded-circle" style="width: 6rem; height: 6rem; box-shadow: 0 2px 8px rgba(0,0,0,0.3);" disabled>
      <i class="bi bi-mic-fill"></i>
    </button>
    <!--<div id="music-score"></div>-->
    <hr>
    <!-- Section d'enregistrement audio -->
    <div id="styleCardRecorder" class="card-body p-1 recorder-container d-flex flex-column text-center">
      <button @click="toggleRecording()" id="start-rec" class="btn btn text-white" style="background-color: #006485;">Démarrer l'enregistrement</button>
      <div id="rec-indicator" class="inactive text-secondary" style="margin-top:10px;">Prêt à enregistrer</div>
      <div id="capture-progress" class="progress-bar" style="width: 0%; height: 10px; background-color: #006485; margin-top:10px; border-radius: 5px;"></div>
      <div id="load-text-bar" class="text-primary"></div>
      <a id="download-link" style="display: none; margin-top:10px;">Télécharger l'enregistrement (.wav)</a>
    </div>
  </div>
</template>

<script setup>
import StaveRepresentation from '@/lib/stave.js';
import MicroRecorder from '@/lib/mic_recorder.js';

import { ref, watch } from 'vue';

defineOptions({
  name: 'MicroRecorder',
});

const micRecorder = MicroRecorder.getInstance();

function startRecording() {
  console.log('start recording');
  try {
    micRecorder.startRecording();
  }
  catch (err) {
    console.error('Microphone access error:', err);
    // updateRecIndicator(false, "Erreur d'accès au micro"); //TODO: define this
    return;
  }
  // updateRecIndicator(true, "Enregistrement en cours...");
}

function stopRecording() {
  console.log('stop recording');
  micRecorder.stopRecording();
}

/**
 * Toggles the recording using the current state to determine the action.
 */
function toggleRecording() {
  if (micRecorder.is_recording.value) {
    stopRecording();
  }
  else {
    startRecording();
  }
}

/**
 * Manages event associated to key presses.
 * only to start / stop recording using space.
 */
function keyListener(event) {
  //---Ignore repeat key for all the following
  if (event.repeat) return;

  // Toggle recording with space
  if (event.type == 'keyup' && event.key == 'Space') {
    toggleRecording();
  }
}
</script>

<style scoped>
.wrapper {
  padding: 35px 40px;
  width: 950px;
  border-radius: 20px;
  /* background: #141414; */
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
  box-shadow: 0 5px 10px rgba(0,0,0,0.3);
  background-color: #dceaf1;
}
.music-score-box svg {
  max-width: 100%;
  max-height: 100%;
}
.score-preview {
  text-decoration: none;
  color:#000;
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
  /* border-bottom: 1px dotted black; */
}
.tooltip-lb .tooltiptext {
  visibility: hidden;
  width: 150px;
  /* background: #62aaddd0; */
  background: #18767ed0;
  /* color: #000; */
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
#styleCardRecorder{
  box-shadow: 0 10px 10px rgba(0,0,0,0.1);
  border: none;
  border-radius: 5px;
}
</style>
