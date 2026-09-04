export type AngolaProvince = {
  code: string;
  name: string;
  capital: string;
  lat: number;
  lng: number;
  region: "norte" | "centro" | "sul" | "leste" | "oeste" | "cabinda";
};

export const ANGOLA_PROVINCES: AngolaProvince[] = [
  { code: "BGO", name: "Bengo", capital: "Caxito", lat: -8.578, lng: 13.664, region: "oeste" },
  { code: "BGU", name: "Benguela", capital: "Benguela", lat: -12.576, lng: 13.405, region: "oeste" },
  { code: "BIE", name: "Bié", capital: "Kuito", lat: -12.383, lng: 16.933, region: "centro" },
  { code: "CAB", name: "Cabinda", capital: "Cabinda", lat: -5.56, lng: 12.19, region: "cabinda" },
  { code: "CCU", name: "Cuando Cubango", capital: "Menongue", lat: -14.655, lng: 17.691, region: "sul" },
  { code: "CNO", name: "Cuanza Norte", capital: "N'dalatando", lat: -9.3, lng: 14.917, region: "norte" },
  { code: "CSU", name: "Cuanza Sul", capital: "Sumbe", lat: -11.206, lng: 13.844, region: "oeste" },
  { code: "CNN", name: "Cunene", capital: "Ondjiva", lat: -17.07, lng: 15.73, region: "sul" },
  { code: "HUA", name: "Huambo", capital: "Huambo", lat: -12.776, lng: 15.739, region: "centro" },
  { code: "HUI", name: "Huíla", capital: "Lubango", lat: -14.917, lng: 13.5, region: "sul" },
  { code: "LUA", name: "Luanda", capital: "Luanda", lat: -8.838, lng: 13.234, region: "oeste" },
  { code: "LNO", name: "Lunda Norte", capital: "Dundo", lat: -7.38, lng: 20.835, region: "leste" },
  { code: "LSU", name: "Lunda Sul", capital: "Saurimo", lat: -9.66, lng: 20.391, region: "leste" },
  { code: "MAL", name: "Malanje", capital: "Malanje", lat: -9.54, lng: 16.341, region: "norte" },
  { code: "MOX", name: "Moxico", capital: "Luena", lat: -11.783, lng: 19.916, region: "leste" },
  { code: "NAM", name: "Namibe", capital: "Moçâmedes", lat: -15.196, lng: 12.152, region: "sul" },
  { code: "UIG", name: "Uíge", capital: "Uíge", lat: -7.608, lng: 15.061, region: "norte" },
  { code: "ZAI", name: "Zaire", capital: "M'banza-Kongo", lat: -6.267, lng: 14.24, region: "norte" },
];

export function provinceByCode(code: string): AngolaProvince | undefined {
  return ANGOLA_PROVINCES.find((p) => p.code === code);
}

export function provinceByName(name: string): AngolaProvince | undefined {
  const n = name.toLowerCase();
  return ANGOLA_PROVINCES.find((p) => p.name.toLowerCase() === n);
}
