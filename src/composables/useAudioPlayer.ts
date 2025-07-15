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
  const currentNoteIndex = ref(0);
  const notes = ref<ParsedNote[]>([]);
  const highlightCallback = ref<((id: string) => void) | null>(null);
  
  let synth: Tone.Synth | null = null;
  let sequence: Tone.Sequence | null = null;
  let currentTempo = 120;

  /**
   * Initialise Tone.js et crée un synthétiseur
   */
  const initializeTone = async () => {
    if (Tone.context.state !== 'running') {
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
          id: id || `note-${index}`
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
      '1': '1n',    // whole note
      '2': '2n',    // half note
      '4': '4n',    // quarter note
      '8': '8n',    // eighth note
      '16': '16n',  // sixteenth note
      '32': '32n'   // thirty-second note
    };
    
    return durationMap[meiDuration] || '4n';
  };

  /**
   * Lance la lecture de la partition
   */
  const playScore = async (meiXML: string, tempo: number = 120) => {
    try {
      await initializeTone();
      
      // Parser les notes du MEI
      const parsedNotes = parseMeiToNotes(meiXML);
      notes.value = parsedNotes;
      
      if (parsedNotes.length === 0) {
        console.warn('Aucune note trouvée dans le MEI');
        return;
      }
      
      // Définir le tempo
      Tone.Transport.bpm.value = tempo;
      currentTempo = tempo;
      
      // Créer une séquence avec les notes
      sequence = new Tone.Sequence((time, note) => {
        // Jouer la note
        if (synth) {
          synth.triggerAttackRelease(note.pitch, note.duration, time);
        }
        
        // Surligner la note si un callback est défini
        if (highlightCallback.value) {
          Tone.Draw.schedule(() => {
            highlightCallback.value?.(note.id);
          }, time);
        }
        
        currentNoteIndex.value = notes.value.indexOf(note);
      }, parsedNotes, '4n');
      
      // Démarrer la lecture
      sequence.start();
      Tone.Transport.start();
      
      isPlayingAudio.value = true;
      
      // Arrêter automatiquement à la fin
      const totalDuration = parsedNotes.length * 0.5; // Durée approximative
      setTimeout(() => {
        if (isPlayingAudio.value) {
          stopScore();
        }
      }, totalDuration * 1000);
      
    } catch (error) {
      console.error('Erreur lors de la lecture:', error);
    }
  };

  /**
   * Met en pause la lecture
   */
  const pauseScore = () => {
    if (Tone.Transport.state === 'started') {
      Tone.Transport.pause();
      isPlayingAudio.value = false;
    }
  };

  /**
   * Reprend la lecture
   */
  const resumeScore = () => {
    if (Tone.Transport.state === 'paused') {
      Tone.Transport.start();
      isPlayingAudio.value = true;
    }
  };

  /**
   * Arrête la lecture
   */
  const stopScore = () => {
    if (sequence) {
      sequence.stop();
      sequence.dispose();
      sequence = null;
    }
    
    Tone.Transport.stop();
    Tone.Transport.cancel();
    
    isPlayingAudio.value = false;
    currentNoteIndex.value = 0;
  };

  /**
   * Met à jour le tempo
   */
  const updateTempo = (newTempo: number) => {
    currentTempo = newTempo;
    Tone.Transport.bpm.value = newTempo;
  };

  /**
   * Définit le callback pour surligner les notes
   */
  const setHighlightCallback = (callback: (id: string) => void) => {
    highlightCallback.value = callback;
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
    currentNoteIndex,
    playScore,
    pauseScore,
    resumeScore,
    stopScore,
    updateTempo,
    setHighlightCallback,
    playNote
  };
}
