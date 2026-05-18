/**
 * Determines if a rejection reason should show a warning page allowing personal info editing
 * instead of completely blocking the user
 * @param reason The rejection reason extracted from moderation comment
 * @returns True if this is a warning-type rejection that allows editing personal info
 */
export const allowsPersonalInfoEditing = (reason: string): boolean => {
  const warningReasons = [
    "Inversion Nom et Prénom",
    "Nom et/ou Prénom manquants",
    "Nom et/ou prénom mal renseignés - Modération non-bloquante",
  ];

  return warningReasons.includes(reason);
};
