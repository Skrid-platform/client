import { durationNoteWithDots } from "../constants";
import StaveRepresentation from '@/lib/stave.js';
import { ref } from "vue";
import api from "../services/axios.ts";

/**
 * Class defining methods to record music from the microphone
 */
class MicroRecorder {
  /** Store when the user records the melody
   * ref makes it reactive for Vue to update the UI
   * @type {ref<boolean>}
   * @default false
   */
  is_recording = ref(false);

  /** Flag to stop recording
   * @type {boolean}
   * @default false
   */
  #stop_recording = false;
  #recorder;
  #stream;
  #chunks;

  #staveRepr;

  static #instance = null;

  constructor() {
    this.is_recording.value = false;
    this.#stop_recording = false;

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
   * Starts the recording for the given duration.
   *
   * Always wrap in a try / catch block to catch potential microphone access errors.
   */
  async startRecording_not_working() {
    if (this.is_recording.value) return;

    this.is_recording.value = true;

    // An error can arise here, it has to be caught by the caller.
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.#stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const source = audioContext.createMediaStreamSource(this.#stream);

    this.#recorder = new Recorder(source, { numChannels: 1 });
    this.#recorder.start();
  }

  /**
   * Starts the recording for the given duration.
   *
   * Always wrap in a try / catch block to catch potential microphone access errors.
   */
  async startRecording() {
    if (this.is_recording.value) return;

    this.is_recording.value = true;

    await this.createRecorder();

    this.#recorder.start();
  }

  /*
   * Creates the stream and recorder (`this.#recorder`).
   */
  async createRecorder() {
    this.#stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.#recorder = new MediaRecorder(this.#stream);

    this.#recorder.ondataavailable = (event) => {
      this.#chunks.push(event.data);
    };

    this.#recorder.onstop = () => {
      const blob = new Blob(this.#chunks, { type: 'audio/mp3' });
      // const url = URL.createObjectURL(blob)

      this.addNotesToStave(blob)

      this.#chunks = [];
    };
  }

  stopRecording() {
    if (!this.is_recording.value || !this.#recorder) return;
    this.is_recording.value = false;

    this.#recorder.stop();
  }

  /*
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
