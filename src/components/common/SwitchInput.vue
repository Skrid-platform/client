<template>
  <div class="wrapper">
    <label class="unselected-label" :class="{ 'selected-label': switchInput.isPianoSelected() }"> Piano </label>

    <label class="switch">
      <input type="checkbox" @change="switchInput.toggle" />
      <span class="slider round"></span>
    </label>

    <label class="unselected-label" :class="{ 'selected-label': switchInput.isMicrophoneSelected() }"> Microphone </label>
  </div>
</template>

<script setup>
import SwitchInput from '@/lib/switch_input.js';
import { onMounted, ref, watch } from 'vue';

defineOptions({
  name: 'SwitchInput',
});

const switchInput = SwitchInput.getInstance();

</script>

<style scoped>
.wrapper {
  padding: 35px 40px;
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

/* For the selected / not selected label (Piano / Microphone) */
.unselected-label {
  color: black;
  padding: 5px;
}
.selected-label {
  text-decoration: underline;
  text-decoration-color: #7ab6e0;
  text-decoration-thickness: 3px;
}

/* CSS and HTML taken from https://www.w3schools.com/howto/howto_css_switch.asp for the switch */
/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-left: 10px;
  margin-right: 10px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #7ab6e0;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}
.slider:before {
  position: absolute;
  content: '';
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  /* background-color: #2196F3; */
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196f3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>
