export type RarityGrade = {
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  tag: string;
};

export const RARITIES: RarityGrade[] = [
  {
    name: "Consumer Grade",
    color: "#b0c3d9",
    bgColor: "rgba(176, 195, 217, 0.15)",
    borderColor: "#b0c3d9",
    glowColor: "rgba(176, 195, 217, 0.4)",
    tag: "CONSUMER",
  },
  {
    name: "Industrial Grade",
    color: "#5e98d9",
    bgColor: "rgba(94, 152, 217, 0.15)",
    borderColor: "#5e98d9",
    glowColor: "rgba(94, 152, 217, 0.4)",
    tag: "INDUSTRIAL",
  },
  {
    name: "Mil-Spec Grade",
    color: "#4b69ff",
    bgColor: "rgba(75, 105, 255, 0.15)",
    borderColor: "#4b69ff",
    glowColor: "rgba(75, 105, 255, 0.4)",
    tag: "MIL-SPEC",
  },
  {
    name: "Restricted",
    color: "#8847ff",
    bgColor: "rgba(136, 71, 255, 0.15)",
    borderColor: "#8847ff",
    glowColor: "rgba(136, 71, 255, 0.4)",
    tag: "RESTRICTED",
  },
  {
    name: "Classified",
    color: "#d32ce6",
    bgColor: "rgba(211, 44, 230, 0.15)",
    borderColor: "#d32ce6",
    glowColor: "rgba(211, 44, 230, 0.4)",
    tag: "CLASSIFIED",
  },
  {
    name: "Covert",
    color: "#eb4b4b",
    bgColor: "rgba(235, 75, 75, 0.18)",
    borderColor: "#eb4b4b",
    glowColor: "rgba(235, 75, 75, 0.5)",
    tag: "COVERT",
  },
  {
    name: "Exceedingly Rare",
    color: "#ffd700",
    bgColor: "rgba(255, 215, 0, 0.2)",
    borderColor: "#ffd700",
    glowColor: "rgba(255, 215, 0, 0.6)",
    tag: "★ SPECIAL ★",
  },
];

/**
 * Hash string to pick deterministic rarity for user
 */
export function getRarity(id: string | number): RarityGrade {
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % RARITIES.length;
  return RARITIES[index];
}
