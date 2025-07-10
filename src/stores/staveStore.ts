// src/stores/authorsStore.ts
import { defineStore } from 'pinia';
import { Renderer, Stave, Formatter, StaveNote, Accidental, Dot } from 'vexflow';


export const useStaveStore = defineStore('stave', {
    state: () => {
        return {
            /** Array containing the notes */
            melody: [] as Array<StaveNote>,

            width: 450 as number, // Width of the stave
            height: 200 as number, // Height of the stave
            init_pentagram_width: 450 as number, // Initial width of the stave (used to ensure a minimum width)

            html_element: null as HTMLDivElement | null, // HTML element where the stave will be rendered
            stave: null as Stave | null, // VexFlow Stave object
            renderer: null as Renderer | null, // VexFlow Renderer object
            context: null as any, // VexFlow rendering context
        }
    },
    getters: {

    },
    actions: {
        setSize(width: number, height: number): void {
            this.width = width;
            this.height = height;
        },

        /**
        * Initiates the HTML (vexflow).
        * @param {HTMLDivElement} html_element - the div where notes will be render
        */
        init(html_element: HTMLDivElement): void {
            this.html_element = html_element;

            // Create an SVG renderer and attach it to the pentagram
            this.renderer = new Renderer(this.html_element, Renderer.Backends.SVG);

            // Configure the rendering context
            this.renderer.resize(this.width, this.height);
            this.context = this.renderer.getContext();
            this.context.setFont('Arial', 10);

            // Finally create the stave with the treble symbol and draw it
            this.stave = new Stave(10, 40, this.width);
            this.stave.addClef("treble");
            this.stave.setContext(this.context).draw();
        },

        /**
        * Resizes the stave width, according to the notes in the melody.
        * Ensures that the minimal width is respected (`init_pentagram_width`).
        */
        resizeStave(): void {
            if (this.stave === null || this.renderer === null) return;
            let totalWidth = 0;
            this.melody.forEach((note) => {
                totalWidth += note.getWidth() + 5;
            });

            totalWidth = Math.max(totalWidth, this.init_pentagram_width);

            // If the new width is greater or smaller than the initial width, update stave width and pentagran_width variable
            if (totalWidth > this.width || totalWidth < this.width) {
                this.stave.setWidth(totalWidth + 100);
                this.renderer.resize(totalWidth + 100, this.height)
                this.width = totalWidth;
            }

            // Cancel the previous pentagram
            const svg = document.querySelector("#music-score svg");
            if (svg === null) return;
            while (svg.firstChild) {
                svg.removeChild(svg.firstChild);
            }
            this.stave.setContext(this.context).draw();

            // Re-draw it
            this.melody.forEach((note) => {
                note.setContext(this.context).draw();
            });
        },

        /**
        * Displays the note to the stave and add it to `melody`.
        *
        * @param {string} note - the note name (e.g C/5, C#/4, with the '/') ;
        * @param {string[]} keys - array of keys ;
        * @param {string} duration - the note duration (w, h, q, 8, 16, 32, hd, qd, 8d, 16d, 32d).
        */
        displayNote(note: string, keys: string[], duration: string): void {
            let display_note: StaveNote;
            if (note == 'r') {
                display_note = new StaveNote({
                    keys: ['B/4'], // just for middle height
                    type: 'r', // rest
                    duration: duration,
                });
            }
            else {
                display_note = new StaveNote({
                    keys: keys,
                    duration: duration,
                    clef: 'treble',
                    autoStem: true
                });
            }

            if (note.includes('#'))
                display_note.addModifier(new Accidental("#"), 0);

            if (duration.includes('d'))
                // display_note.addModifier(new Dot(), 0);
                Dot.buildAndAttach([display_note], { all: true });

            this.melody.push(display_note);

            // Format stave and all notes
            Formatter.FormatAndDraw(this.context, this.stave as Stave, this.melody as StaveNote[]);

            this.resizeStave();
        },

        /**
        * Changes the last note on the stave for one with the same pitch, but with a different rhythm.
        *
        * @param {string} newRhythm - the new wanted rhythm.
        */
        changeLastNoteRhythm(newRhythm: string): void {
            // If there is no note to modify, abort
            if (this.melody.length == 0)
                return;

            // Remove last note
            let last_note: StaveNote = this.melody[this.melody.length - 1] as StaveNote;
            let note = last_note.keys[0];
            if (last_note.getNoteType() == 'r')
                note = 'r';

            this.remove_last_note();

            // Add the note with the new rhythm
            this.displayNote(note, last_note.keys, newRhythm);
        },

        /**
        * Remove from the melody array all the inserted note and clear the stave as well
        */
        clear_all_pattern(): void {
            this.melody = [];

            // Cancel the previous pentagram
            let pentagram_svg = document.querySelector("#music-score svg")!;
            pentagram_svg.replaceChildren(); // remove all the svg child nodes
            (this.stave as Stave).setContext(this.context).draw();

            this.resizeStave();
        },

        /**
        * Remove from the melody array the last inserted note and re-draw the pentagram
        */
        remove_last_note(): void {
            this.melody.pop();

            // Cancel the previous pentagram
            let pentagram_svg = document.querySelector("#music-score svg")!;
            while (pentagram_svg.firstChild) {
                pentagram_svg.removeChild(pentagram_svg.firstChild);
            }
            (this.stave as Stave).setContext(this.context).draw();

            // Re-draw the pentagram
            this.melody.forEach((note) => {
                note.setContext(this.context).draw();
            });

            this.resizeStave();
        }
    },
})
