<template>
  <div>
    <div class="search-pattern">
      <stave></stave>

      <switch-input :piano-selected="pianoSelected" @toggle="pianoSelected = !pianoSelected"></switch-input>

      <keyboard v-if="pianoSelected"></keyboard>
      <micro-recorder v-else></micro-recorder>

      <search-param @receiveData="getData" @showPaginatedResult="showPaginatedResults()"></search-param>
    </div>
    <paginated-results :loading="resultsIsLoading" :data="searchResults" v-if="paginatedIsShown" />
  </div>
</template>

<script setup>
import Stave from '@/components/common/Stave.vue';
import SwitchInput from '@/components/common/SwitchInput.vue';
import Keyboard from '@/components/common/Keyboard.vue';
import MicroRecorder from '@/components/common/MicroRecorder.vue';
import SearchParam from '@/components/common/SearchParam.vue';
import PaginatedResults from '@/components/common/PaginatedResults.vue';

import { ref } from 'vue';

defineOptions({
  name: 'SearchInterfaceView',
});

const paginatedIsShown = ref(false); // no search initialy done so paginated results are not shown
const searchResults = ref([]); // this will contain the results from SearchParam component
const resultsIsLoading = ref(false); // this will be set to true when results are being fetched
// and set to false when results are received
const pianoSelected = ref(true); // piano is shown first

function showPaginatedResults() {
  // This function is called when the SearchParam start a search
  paginatedIsShown.value = true;
  resultsIsLoading.value = true; // Set loading state to true while results are being fetched
}

function getData(data) {
  // This function receives the data from SearchParam component
  // and updates the searchResults to displayed them in PaginatedResults component
  // It also sets the loading state to false after data is received
  searchResults.value = data;
  resultsIsLoading.value = false; // Set loading state to false after data is received
}
</script>

<style scoped>
.search-pattern {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 20px;
  gap: 10px;
  position: relative;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
