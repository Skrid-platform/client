import { durationNoteWithDots } from "../constants";
import StaveRepresentation from '@/lib/stave.js';
import { ref } from "vue";
import api from "../services/axios.ts";

/**
 * Class defining methods to record music from the microphone, and display the converted result to
 * the stave.
 */
class MicroRecorder {
  /** Store when the user records the melody
   * ref makes it reactive for Vue to update the UI
   * @type {ref<boolean>}
   * @default false
   */
  is_recording = ref(false);

  /**
   * Store the URL of the blob of the last recording.
   *
   * @type {ref<string|undefined>}
   * @default undefined
   */
  last_url = ref(undefined)

  #recorder;
  #stream;
  #chunks;

  #staveRepr;

  static #instance = null;

  constructor() {
    this.is_recording.value = false;
    this.#chunks = [];
    this.#staveRepr = StaveRepresentation.getInstance()
  }

  /**
   * Returns the singleton instance of MicroRecorder.
   * @returns {MicroRecorder} - the singleton instance of MicroRecorder.
   */
  static getInstance() {
    if (MicroRecorder.#instance === null) {
      MicroRecorder.#instance = new MicroRecorder();
    }

    return MicroRecorder.#instance;
  }

  /**
   * Creates the stream and recorder (`this.#recorder`).
   */
  async createRecorder() {
    this.#stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.#recorder = new MediaRecorder(this.#stream);

    // When data is available, add it to the chunks
    this.#recorder.ondataavailable = (event) => {
      this.#chunks.push(event.data);
    };

    // When stopping, send blob to the function that make a call to the API and that displays to the
    // stave then.
    this.#recorder.onstop = () => {
      const blob = new Blob(this.#chunks, { type: 'audio/mp3' });
      this.last_url.value = URL.createObjectURL(blob);

      this.addNotesToStave(blob)

      this.#chunks = []; // Reset the array for next recording.
    };
  }

  /**
   * Starts the recording.
   *
   * It also clears the stave before recording.
   * Does nothing if there is already a recording in progress.
   * Always wrap in a try / catch block to catch potential microphone access errors.
   */
  async startRecording() {
    if (this.is_recording.value) return;
    this.is_recording.value = true;

    // Create the recorder
    await this.createRecorder();

    // Start the recorder
    this.#recorder.start();

    // Clear the stave
    this.#staveRepr.clear_all_pattern();
  }

  /**
   * Stops the recording.
   *
   * Does nothing if there is no recording in progress.
   */
  stopRecording() {
    if (!this.is_recording.value || !this.#recorder) return;
    this.is_recording.value = false;

    this.#recorder.stop();
  }

  /**
   * Uses `this.convertAudioToNotes` to get the notes from the blob, and display them onto the
   * stave.
   *
   * @param {Blob} blob - the blob containing the recorded audio
   */
  addNotesToStave(blob) {
    this.convertAudioToNotes(blob).then(notes => {
      console.log(notes);

      notes.forEach(n => {
        let pitch = n[0];
        let dur = n[1];
        let dots = n[2];

        let pitch_0, pitch_arr;
        pitch_0 = pitch[0];
        pitch_arr = pitch;

        if (dots >= 1) { // Ignore more dots
          dur += 'd';
        }

        this.#staveRepr.displayNote(pitch_0, pitch_arr, dur);
      });
    });
  }

  /**
   * Send the recorded audio file to the backend in order to convert it to music notes (using `/convert-recording`).
   *
   * @param {Blob} blob - the recorded audio blob.
   *
   * @returns {Promise} the notes
   */
  async convertAudioToNotes(blob) {
    const formData = new FormData();
    formData.append('file', blob, 'audio.mp3');

    return api.post('/convert-recording', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(response => response.data)
      .then(data => data.notes)
      .then(notes =>  notes)
      .catch(err => {
        console.error("Erreur lors de l'envoi du fichier audio :", err);
      });
  }
}

export default MicroRecorder;
