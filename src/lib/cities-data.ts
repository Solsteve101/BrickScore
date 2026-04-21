export interface City {
  city: string
  state: string
}

export const CITIES: City[] = [
  { city: 'Berlin', state: 'BE' },
  { city: 'München', state: 'BY' }, { city: 'Nürnberg', state: 'BY' },
  { city: 'Augsburg', state: 'BY' }, { city: 'Würzburg', state: 'BY' },
  { city: 'Regensburg', state: 'BY' }, { city: 'Ingolstadt', state: 'BY' },
  { city: 'Fürth', state: 'BY' }, { city: 'Erlangen', state: 'BY' },
  { city: 'Bayreuth', state: 'BY' }, { city: 'Bamberg', state: 'BY' },
  { city: 'Passau', state: 'BY' }, { city: 'Landshut', state: 'BY' },
  { city: 'Stuttgart', state: 'BW' }, { city: 'Karlsruhe', state: 'BW' },
  { city: 'Mannheim', state: 'BW' }, { city: 'Freiburg', state: 'BW' },
  { city: 'Heidelberg', state: 'BW' }, { city: 'Heilbronn', state: 'BW' },
  { city: 'Ulm', state: 'BW' }, { city: 'Pforzheim', state: 'BW' },
  { city: 'Reutlingen', state: 'BW' }, { city: 'Tübingen', state: 'BW' },
  { city: 'Esslingen', state: 'BW' }, { city: 'Konstanz', state: 'BW' },
  { city: 'Köln', state: 'NW' }, { city: 'Düsseldorf', state: 'NW' },
  { city: 'Dortmund', state: 'NW' }, { city: 'Essen', state: 'NW' },
  { city: 'Duisburg', state: 'NW' }, { city: 'Bochum', state: 'NW' },
  { city: 'Wuppertal', state: 'NW' }, { city: 'Bielefeld', state: 'NW' },
  { city: 'Bonn', state: 'NW' }, { city: 'Münster', state: 'NW' },
  { city: 'Gelsenkirchen', state: 'NW' }, { city: 'Mönchengladbach', state: 'NW' },
  { city: 'Aachen', state: 'NW' }, { city: 'Krefeld', state: 'NW' },
  { city: 'Oberhausen', state: 'NW' }, { city: 'Hagen', state: 'NW' },
  { city: 'Hamm', state: 'NW' }, { city: 'Mülheim an der Ruhr', state: 'NW' },
  { city: 'Leverkusen', state: 'NW' }, { city: 'Solingen', state: 'NW' },
  { city: 'Herne', state: 'NW' }, { city: 'Neuss', state: 'NW' },
  { city: 'Paderborn', state: 'NW' }, { city: 'Recklinghausen', state: 'NW' },
  { city: 'Bottrop', state: 'NW' }, { city: 'Siegen', state: 'NW' },
  { city: 'Frankfurt am Main', state: 'HE' }, { city: 'Wiesbaden', state: 'HE' },
  { city: 'Kassel', state: 'HE' }, { city: 'Darmstadt', state: 'HE' },
  { city: 'Offenbach', state: 'HE' }, { city: 'Hanau', state: 'HE' },
  { city: 'Gießen', state: 'HE' }, { city: 'Marburg', state: 'HE' },
  { city: 'Fulda', state: 'HE' },
  { city: 'Hannover', state: 'NI' }, { city: 'Braunschweig', state: 'NI' },
  { city: 'Oldenburg', state: 'NI' }, { city: 'Osnabrück', state: 'NI' },
  { city: 'Wolfsburg', state: 'NI' }, { city: 'Göttingen', state: 'NI' },
  { city: 'Salzgitter', state: 'NI' }, { city: 'Hildesheim', state: 'NI' },
  { city: 'Lüneburg', state: 'NI' }, { city: 'Celle', state: 'NI' },
  { city: 'Hamburg', state: 'HH' },
  { city: 'Bremen', state: 'HB' }, { city: 'Bremerhaven', state: 'HB' },
  { city: 'Leipzig', state: 'SN' }, { city: 'Dresden', state: 'SN' },
  { city: 'Chemnitz', state: 'SN' }, { city: 'Zwickau', state: 'SN' },
  { city: 'Görlitz', state: 'SN' }, { city: 'Plauen', state: 'SN' },
  { city: 'Mainz', state: 'RP' }, { city: 'Ludwigshafen', state: 'RP' },
  { city: 'Koblenz', state: 'RP' }, { city: 'Trier', state: 'RP' },
  { city: 'Kaiserslautern', state: 'RP' }, { city: 'Worms', state: 'RP' },
  { city: 'Speyer', state: 'RP' },
  { city: 'Kiel', state: 'SH' }, { city: 'Lübeck', state: 'SH' },
  { city: 'Flensburg', state: 'SH' }, { city: 'Neumünster', state: 'SH' },
  { city: 'Potsdam', state: 'BB' }, { city: 'Cottbus', state: 'BB' },
  { city: 'Brandenburg an der Havel', state: 'BB' },
  { city: 'Frankfurt (Oder)', state: 'BB' }, { city: 'Oranienburg', state: 'BB' },
  { city: 'Magdeburg', state: 'ST' }, { city: 'Halle (Saale)', state: 'ST' },
  { city: 'Dessau-Roßlau', state: 'ST' }, { city: 'Wittenberg', state: 'ST' },
  { city: 'Erfurt', state: 'TH' }, { city: 'Jena', state: 'TH' },
  { city: 'Gera', state: 'TH' }, { city: 'Weimar', state: 'TH' },
  { city: 'Eisenach', state: 'TH' },
  { city: 'Rostock', state: 'MV' }, { city: 'Schwerin', state: 'MV' },
  { city: 'Stralsund', state: 'MV' }, { city: 'Greifswald', state: 'MV' },
  { city: 'Wismar', state: 'MV' }, { city: 'Neubrandenburg', state: 'MV' },
  { city: 'Saarbrücken', state: 'SL' }, { city: 'Saarlouis', state: 'SL' },
]

export function normCity(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss')
}
