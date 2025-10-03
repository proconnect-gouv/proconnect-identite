//

export const libelleFromCodeEffectif = (
  libelle: string | null,
  anneeEffectif: string | null,
) => {
  if (libelle && anneeEffectif) {
    return `${libelle}, en ${anneeEffectif}`;
  }

  if (libelle) {
    return libelle;
  }

  return "";
};
