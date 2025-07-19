import { ref } from 'vue';

/**
 * Class helping to switch from the piano and the microphone.
 */
class SwitchInput {
  /**
   * Store the current input (piano: true, microphone: false).
   * ref makes it reactive for Vue to update the UI
   *
   * @type {ref<boolean>}
   * @default true
   */
  piano_selected = ref(true);

  static #instance = null;

  constructor() {
    this.piano_selected.value = true;
  }

  /**
   * Returns the singleton instance of SwitchInput.
   * @returns {SwitchInput} - The singleton instance of SwitchInput
   */
  static getInstance() {
    if (SwitchInput.#instance === null) {
      SwitchInput.#instance = new SwitchInput();
    }

    return SwitchInput.#instance;
  }

  /**
   * @returns {boolean} true if and only if the piano is selected
   */
  isPianoSelected() {
    return this.piano_selected.value;
  }

  /**
   * @returns {boolean} true if and only if the microphone is selected
   */
  isMicrophoneSelected() {
    return !this.piano_selected.value;
  }

  /**
   * Sets the value to have the piano displayed
   */
  displayPiano() {
    this.piano_selected.value = true;
  }

  /**
   * Sets the value to have the microphone displayed
   */
  displayMicrophone() {
    this.piano_selected.value = false;
  }

  /**
   * Toggles the internal value of the switch.
   */
  toggle() {
    if (this.isPianoSelected()) this.displayMicrophone();
    else this.displayPiano();
  }
}

export default SwitchInput;
