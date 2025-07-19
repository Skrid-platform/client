import { ref, onUnmounted } from 'vue';
import * as Tone from 'tone';

interface ParsedNote {
  pitch: string;
  duration: string;
  id: string;
}

/**
 * Composable for audio playback management with Tone.js
 */
export function useAudioPlayer() {
  const isPlayingAudio = ref(false);
  const isPausedAudio = ref(false);
  const isStoppedAudio = ref(true);
  let highlightCallback: ((id: string) => void) | null = null;
  let removeHighlightCallback: (() => void) | null = null;

  let synth: Tone.Synth | null = null;
  let part: Tone.Part | null = null;

  /**
   * Initializes Tone.js and creates a synthesizer
   * @returns {Promise<void>} A promise that resolves when Tone.js is ready
   * @throws {Error} If Tone.js context cannot be started
   */
  const initializeTone = async () => {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }

    if (!synth) {
      synth = new Tone.Synth().toDestination();
    }
  };

  /**
   * Parses MEI XML to extract notes and their information
   * @param {string} meiXML - The MEI XML content to parse
   * @returns {ParsedNote[]} An array of parsed notes with pitch, duration and id
   */
  const parseMeiToNotes = (meiXML: string): ParsedNote[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(meiXML, 'text/xml');

    const noteElements = xmlDoc.querySelectorAll('note');
    const parsedNotes: ParsedNote[] = [];

    noteElements.forEach((noteEl, index) => {
      const pitch = noteEl.getAttribute('pname');
      const octave = noteEl.getAttribute('oct');
      const duration = noteEl.getAttribute('dur') || '4';
      const id = noteEl.getAttribute('xml:id');

      if (pitch && octave) {
        // Convert to Tone.js pitch notation
        const tonePitch = `${pitch.toUpperCase()}${octave}`;

        // Convert MEI duration to Tone.js duration
        const toneDuration = convertMeiDurationToTone(duration);

        parsedNotes.push({
          pitch: tonePitch,
          duration: toneDuration,
          id: id || `note-${index}`,
        });
      }
    });

    return parsedNotes;
  };

  /**
   * Converts MEI duration to Tone.js duration
   * @param {string} meiDuration - The MEI duration string
   * @returns {string} The corresponding Tone.js duration
   */
  const convertMeiDurationToTone = (meiDuration: string): string => {
    const durationMap: Record<string, string> = {
      '1': '1n', // whole note
      '2': '2n', // half note
      '4': '4n', // quarter note
      '8': '8n', // eighth note
      '16': '16n', // sixteenth note
      '32': '32n', // thirty-second note
    };

    return durationMap[meiDuration] || '4n';
  };

  /**
   * Starts score playback
   * @param {string} meiXML - The MEI XML content to play
   * @param {number} tempo - The tempo for playback (default: 120 BPM
   */
  const playScore = async (meiXML: string, tempo: number = 120) => {
    if (isPausedAudio.value || isPlayingAudio.value) {
      stopScore();
    }
    try {
      await initializeTone();

      // Parse the notes from the MEI
      const parsedNotes = parseMeiToNotes(meiXML);

      if (parsedNotes.length === 0) {
        console.warn('No notes found in the MEI');
        return;
      }

      // set the tempo
      Tone.getTransport().bpm.value = tempo;

      // Create events for Tone.Part
      const events: Array<{ time: number; note: ParsedNote }> = [];
      let currentTime = 0;

      parsedNotes.forEach((note) => {
        events.push({
          time: currentTime,
          note: note,
        });

        // Calculate the time for the next note based on the current duration
        const noteDuration = Tone.Time(note.duration).toSeconds();
        currentTime += noteDuration;
      });

      // Automatically stop at the end
      const lastEvent = events.length > 0 ? events[events.length - 1] : undefined;
      const totalDuration = lastEvent ? lastEvent.time + Tone.Time(lastEvent.note.duration).toSeconds() : 0;
      Tone.getTransport().scheduleOnce(() => {
        stopScore();
      }, totalDuration);

      // Create a Part with the events
      part = new Tone.Part((time, event) => {
        // Play the note
        if (synth) {
          synth.triggerAttackRelease(event.note.pitch, event.note.duration, time);
        }

        // Highlight the note if a callback is defined
        if (highlightCallback) {
          Tone.getDraw().schedule(() => {
            removeHighlightCallback?.(); // Remove the previous highlight
            highlightCallback?.(event.note.id); // Highlight the current note
          }, time);
        }
      }, events);

      // Start playback
      part.start();
      Tone.getTransport().start();

      // Update playback state
      isPlayingAudio.value = true;
      isPausedAudio.value = false;
      isStoppedAudio.value = false;
    } catch (error) {
      console.error('Error during playback:', error);
    }
  };

  /**
   * Pauses playback
   */
  const pauseScore = () => {
    if (Tone.getTransport().state === 'started') {
      Tone.getTransport().pause();
      isPlayingAudio.value = false;
      isPausedAudio.value = true;
      isStoppedAudio.value = false;
    }
  };

  /**
   * Resumes playback
   */
  const resumeScore = () => {
    if (Tone.getTransport().state === 'paused') {
      Tone.getTransport().start();
      isPlayingAudio.value = true;
      isPausedAudio.value = false;
      isStoppedAudio.value = false;
    }
  };

  /**
   * Stops playback
   */
  const stopScore = () => {
    if (part) {
      part.stop();
      part.dispose();
      part = null;
    }

    Tone.getTransport().stop();
    Tone.getTransport().cancel();

    if (removeHighlightCallback) {
      removeHighlightCallback();
    }

    isPlayingAudio.value = false;
    isPausedAudio.value = false;
    isStoppedAudio.value = true;
  };

  /**
   * Updates the tempo
   * @param {number} newTempo - The new tempo to set
   */
  const updateTempo = (newTempo: number) => {
    Tone.getTransport().bpm.value = newTempo;
  };

  /**
   * Sets the callbacks for note highlighting during playback
   * @param highlight - Function to call for highlighting a note
   * @param removeHighlight - Function to call for removing highlight
   */
  const setHighlightCallbacks = (highlight: (id: string) => void, removeHighlight: () => void) => {
    highlightCallback = highlight;
    removeHighlightCallback = removeHighlight;
  };

  /**
   * Plays a specific note
   * @param {string} pitch - The pitch of the note to play
   * @param {string} duration - The duration of the note (default: '4n')
   */
  const playNote = async (pitch: string, duration: string = '4n') => {
    await initializeTone();
    if (synth) {
      synth.triggerAttackRelease(pitch, duration);
    }
  };

  // Cleaning on Unmounted
  onUnmounted(() => {
    stopScore();
    if (synth) {
      synth.dispose();
    }
  });

  return {
    isPlayingAudio,
    isPausedAudio,
    isStoppedAudio,
    playScore,
    pauseScore,
    resumeScore,
    stopScore,
    updateTempo,
    setHighlightCallbacks,
    playNote,
  };
}
