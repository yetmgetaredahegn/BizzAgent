/*
 * The 17 Sustainable Development Goals with official colours and a
 * plain-language line an applicant can follow without training.
 */

export interface Sdg {
  number: number;
  name: string;
  plain: string;
  color: string;
}

export const SDGS: Sdg[] = [
  { number: 1, name: "No Poverty", plain: "Helps families earn enough to live.", color: "#E5243B" },
  { number: 2, name: "Zero Hunger", plain: "More or better food is grown, processed or sold.", color: "#DDA63A" },
  { number: 3, name: "Good Health and Well-being", plain: "People are healthier or safer.", color: "#4C9F38" },
  { number: 4, name: "Quality Education", plain: "People learn skills they can use.", color: "#C5192D" },
  { number: 5, name: "Gender Equality", plain: "Women get fair work, pay and a voice.", color: "#FF3A21" },
  { number: 6, name: "Clean Water and Sanitation", plain: "Cleaner water or toilets.", color: "#26BDE2" },
  { number: 7, name: "Affordable and Clean Energy", plain: "Cheaper or cleaner power, like solar.", color: "#FCC30B" },
  { number: 8, name: "Decent Work and Economic Growth", plain: "The business grows and creates good jobs.", color: "#A21942" },
  { number: 9, name: "Industry, Innovation and Infrastructure", plain: "New machines, methods or ideas.", color: "#FD6925" },
  { number: 10, name: "Reduced Inequalities", plain: "People who are often left out get a chance.", color: "#DD1367" },
  { number: 11, name: "Sustainable Cities and Communities", plain: "Towns become better places to live.", color: "#FD9D24" },
  { number: 12, name: "Responsible Consumption and Production", plain: "Less waste, things repaired or reused.", color: "#BF8B2E" },
  { number: 13, name: "Climate Action", plain: "Less pollution that heats the planet.", color: "#3F7E44" },
  { number: 14, name: "Life Below Water", plain: "Rivers, lakes and seas are protected.", color: "#0A97D9" },
  { number: 15, name: "Life on Land", plain: "Forests, soil and animals are protected.", color: "#56C02B" },
  { number: 16, name: "Peace, Justice and Strong Institutions", plain: "Fair rules and honest institutions.", color: "#00689D" },
  { number: 17, name: "Partnerships for the Goals", plain: "Organisations working together.", color: "#19486A" },
];

export function parseSdg(label: string): Sdg | undefined {
  const match = label.match(/(\d{1,2})/);
  if (!match) return undefined;
  return SDGS.find((sdg) => sdg.number === Number(match[1]));
}

export function sdgLabel(number: number): string {
  const sdg = SDGS.find((s) => s.number === number);
  return sdg ? `SDG ${sdg.number}: ${sdg.name}` : `SDG ${number}`;
}
