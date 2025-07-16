import { durationNote } from '@/constants/index.ts';
import { nextTick } from 'vue';

import type { Match, Note } from '@/types/api.ts';

/**
 * Return the sub-array corresponding to the data from page `pageNb`.
 *
 * @param {*} data - the page data ;
 * @param {number} pageNb - the number of the page to get
 * @param {number} numberPerPage - the number of items per page. '*' for all.
 *
 * @return {json[]} data for the page `pageNb`.
 */
export function getPageN(data: any[], pageNb: number, numberPerPage: number) {
  return data.slice((pageNb - 1) * numberPerPage, pageNb * numberPerPage);
}

/**
 * Return the color to use.
 *
 * Internally it uses three colours.
 *
 * @param {float} degree - the match degree for a given note
 * @returns {string} a color corresponding best to `degree`
 */
function getGradientColor(degree: any): string {
  const gray = { r: 100, g: 100, b: 100 };
  const white = { r: 255, g: 255, b: 255 };
  const red = { r: 255, g: 0, b: 0 };
  const green = { r: 0, g: 255, b: 0 };
  const dark_green = { r: 0, g: 179, b: 0 };
  const blue = { r: 0, g: 0, b: 255 };
  const yellow = { r: 255, g: 255, b: 0 };
  const dark_yellow = { r: 215, g: 215, b: 0 };
  const cyan = { r: 0, g: 255, b: 255 };

  const a = dark_green;
  const b = dark_yellow;
  const c = red;

  if (degree > 0.5)
    return interpolateBetweenColors(a, b, 200 * (degree - 0.5)); // the degree is transformed from interval ]0.5 ; 1] to ]0 ; 100] linearly.
  else return interpolateBetweenColors(b, c, 200 * degree); // the degree is transformed from interval [0 ; 0.5] to [0 ; 100] linearly.

  // return interpolateBetweenColors(dark_green, red, 100 * degree);
}

/**
 * Return a color between `fromColor` and `toColor`, at `percent`%
 *
 * @param {json} fromColor - the origin color (0%). Format : {r: [nb], g: [nb], b: [nb]}, with 0 <= nb < 256 ;
 * @param {json} toColor - the destination color (100%). Format : {r: [nb], g: [nb], b: [nb]} ;
 * @param {number} percent - the percentage.
 *
 * @returns {string} an RGB string.
 */
function interpolateBetweenColors(fromColor: any, toColor: any, percent: number): string {
  const delta = percent / 100;
  const r = Math.round(toColor.r + (fromColor.r - toColor.r) * delta);
  const g = Math.round(toColor.g + (fromColor.g - toColor.g) * delta);
  const b = Math.round(toColor.b + (fromColor.b - toColor.b) * delta);

  return `rgb(${r}, ${g}, ${b})`;
}

export function colorMatches(matches: Match[]) {
  // color the matches
  nextTick().then(() => {
    for (let match_nb = matches.length - 1; match_nb >= 0; --match_nb) {
      // Reverse order to get the best color in last 'layer'
      const notes: Note[] = matches[match_nb].notes;
      notes.forEach((note) => {
        const deg = Math.floor(100 * note.note_deg);
        const id = note.id;
        const col = getGradientColor(deg / 100);
        const notehead = document.getElementById(id);
        if (notehead) {
          notehead.setAttribute('fill', col);
        }
      });
    }
  });
}

/**
 * Create the `notes` for the python script
 * @param {Array<StaveNote>} melody - the melody to convert to a query parameter ;
 * @param {boolean} ignore_pitch - if true, the pitch of the notes is ignored ;
 * @param {boolean} ignore_rhythm - if true, the rhythm of the notes is ignored ;
 *
 * @return {string} the notes query parameter, ready to be used in the python script.
 */
export function createNotesQueryParam(melody: any, ignore_pitch: boolean, ignore_rhythm: boolean) {
  let notes = '[';
  for (let k = 0; k < melody.length; ++k) {
    notes += '([';

    //---Add pitch (class + octave)
    for (let note_idx = 0; note_idx < melody[k].keys.length; ++note_idx) {
      const note = melody[k].keys[note_idx];

      //---Add note class ('a', 'gs', ...)
      if (ignore_pitch) notes += 'None, ';
      else if ((melody[k] as any).noteType == 'r')
        // rest
        notes += "'r', ";
      else notes += `'${note}', `;
    }
    notes = notes.slice(0, -2) + '], '; // Remove trailing ', '

    //---Add duration
    if (ignore_rhythm) notes += 'None, 0), ';
    else {
      const dur = 1 / durationNote[melody[k].duration];
      const dots = melody[k].dots || 0;

      notes += `${dur}, ${dots}), `;
    }
  }

  notes = notes.slice(0, -2) + ']'; // Remove trailing ', ' and add ']'.

  return notes;
}

export function extractTitleFromMeiXML(meiXML: string): string {
  // Try to extract the title from the <pgHead> tag
  return (
    meiXML
      .match(/<pgHead.*?<\/pgHead>/s)?.[0]
      .match(/<rend.*?<\/rend>/s)?.[0]
      .match(/>.*?</s)?.[0]
      .slice?.(1, -1) ?? // if no pgHead found, try to get title from <title> tag
    meiXML
      .match(/<title>.*?<\/title>/s)?.[0]
      .match(/>.*?</s)?.[0]
      .slice?.(1, -1) ?? // if no title found, return a default value
    'Titre inconnu'
  );
}
