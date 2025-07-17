import { ref, onUnmounted } from 'vue';
import * as Tone from 'tone';

interface ParsedNote {
  pitch: string;
  duration: string;
  time: number;
  id: string;
}

/**
 * Composable pour la gestion de la lecture audio avec Tone.js
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
   * Initialise Tone.js et crée un synthétiseur
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
   * Parse le MEI XML pour extraire les notes et leurs informations
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
        // Convertir en notation Tone.js
        const tonePitch = `${pitch.toUpperCase()}${octave}`;

        // Convertir la durée MEI en durée Tone.js
        const toneDuration = convertMeiDurationToTone(duration);

        parsedNotes.push({
          pitch: tonePitch,
          duration: toneDuration,
          time: index * 0.5, // Timing basique, à améliorer
          id: id || `note-${index}`,
        });
      }
    });

    return parsedNotes;
  };

  /**
   * Convertit une durée MEI en durée Tone.js
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
   * Lance la lecture de la partition
   */
  const playScore = async (meiXML: string, tempo: number = 120) => {
    if (isPausedAudio.value || isPlayingAudio.value) {
      stopScore();
    }
    try {
      await initializeTone();

      // Parser les notes du MEI
      const parsedNotes = parseMeiToNotes(meiXML);

      if (parsedNotes.length === 0) {
        console.warn('Aucune note trouvée dans le MEI');
        return;
      }

      // Définir le tempo
      Tone.getTransport().bpm.value = tempo;

      // Créer les événements pour Tone.Part
      const events: Array<{ time: number; note: ParsedNote }> = [];
      let currentTime = 0;

      parsedNotes.forEach((note, index) => {
        events.push({
          time: currentTime,
          note: note,
        });

        // Calculer le temps pour la prochaine note basé sur la durée actuelle
        const noteDuration = Tone.Time(note.duration).toSeconds();
        currentTime += noteDuration;
      });

      // Arrêter automatiquement à la fin
      const lastEvent = events.length > 0 ? events[events.length - 1] : undefined;
      const totalDuration = lastEvent ? lastEvent.time + Tone.Time(lastEvent.note.duration).toSeconds() : 0;

      /*
      events.reduce((total, event) => {
        return total + Tone.Time(event.note.duration).toSeconds();
      }, 0);
      */
      Tone.getTransport().scheduleOnce(() => {
        stopScore();
      }, totalDuration);

      // Créer un Part avec les événements
      part = new Tone.Part((time, event) => {
        // Jouer la note
        if (synth) {
          synth.triggerAttackRelease(event.note.pitch, event.note.duration, time);
        }

        // Surligner la note si un callback est défini
        if (highlightCallback) {
          Tone.getDraw().schedule(() => {
            highlightCallback?.(event.note.id);
          }, time);
        }
      }, events);

      // Démarrer la lecture
      part.start();
      Tone.getTransport().start();

      isPlayingAudio.value = true;
      isPausedAudio.value = false;
      isStoppedAudio.value = false;
    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
    }
  };

  /**
   * Met en pause la lecture
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
   * Reprend la lecture
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
   * Arrête la lecture
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
   * Met à jour le tempo
   */
  const updateTempo = (newTempo: number) => {
    Tone.getTransport().bpm.value = newTempo;
  };

  /**
   * Définit le callback pour surligner les notes
   */
  const setHighlightCallbacks = (highlight: (id: string) => void, removeHighlight: () => void) => {
    highlightCallback = highlight;
    removeHighlightCallback = removeHighlight;
  };

  /**
   * Joue une note spécifique
   */
  const playNote = async (pitch: string, duration: string = '4n') => {
    await initializeTone();
    if (synth) {
      synth.triggerAttackRelease(pitch, duration);
    }
  };

  // Nettoyage lors de la destruction du composant
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
