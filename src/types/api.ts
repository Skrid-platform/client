export type Note = {
  note_deg: number;
  pitch_deg: number;
  duration_deg: number;
  sequencing_deg: number;
  id: string;
};

export type Match = {
  overall_degree: number;
  notes: Note[];
};

export type DataResults = {
  source: string;
  number_of_occurrences: number;
  max_match_degree: number;
  matches: Match[];
};
