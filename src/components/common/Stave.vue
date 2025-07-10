<template>
  <div>
    <div id="music-score"></div>
    <div class="clear_buttons">
      <button @click="staveRepr.clear_all_pattern()" type="button" class="btn btn-info text-white">Supprimer tout</button>
      <button @click="staveRepr.remove_last_note()" type="button" class="btn btn-info text-white">
        Supprimer la dernière note
      </button>
      <button
        type="button"
        class="btn btn-info text-white"
        v-if="player.is_playing.value"
        @click="player.stopMelody()"
        id="stop_melody"
      >
        Arrêter la mélodie
      </button>
      <button v-else @click="player.playMelody(staveRepr.melody)" type="button" class="btn btn-info text-white">
        Jouer la mélodie
      </button>
    </div>
  </div>
</template>

<script setup>
import Player from '@/lib/player.js';
import StaveRepresentation from '@/lib/stave.js';
import { onMounted } from 'vue';

defineOptions({
  name: 'Stave',
});

const staveRepr = StaveRepresentation.getInstance();
const player = Player.getInstance();

function keyListener(event) {
  //---Delete all
  if (event.key == 'Backspace' && event.ctrlKey) {
    staveRepr.clear_all_pattern();
  }
  //---Delete last note
  else if (event.key == 'Backspace') {
    staveRepr.remove_last_note();
  }
  //---Play melody
  else if (event.key == ' ' && !event.repeat) {
    event.preventDefault(); // prevent scrolling
    if (player.is_playing.value) {
      player.stopMelody();
    } else {
      player.playMelody(staveRepr.melody);
    }
  }
}

onMounted(() => {
  staveRepr.init();

  // bind keyboard events
  document.addEventListener('keydown', keyListener);
});
</script>

<style scoped>
#stop_melody {
  background: red;
}
button {
  background: #7ab6e0;
}
.clear_buttons {
  align-self: center;
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>