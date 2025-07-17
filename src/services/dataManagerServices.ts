import { durationNote } from '@/constants/index.ts';
import { nextTick } from 'vue';
import { getGradientColor as getColor } from '@/services/colorService.ts';

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

export function colorMatches(matches: Match[]) {
  // color the matches
  nextTick().then(() => {
    for (let match_nb = matches.length - 1; match_nb >= 0; --match_nb) {
      // Reverse order to get the best color in last 'layer'
      const notes: Note[] = matches[match_nb].notes;
      notes.forEach((note) => {
        const deg = Math.floor(100 * note.note_deg);
        const id = note.id;
        const col = getColor(deg);
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
      let note = melody[k].keys[note_idx];

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
      let dur = 1 / durationNote[melody[k].duration];
      let dots = melody[k].dots || 0;

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
