/**
 * Extracts the rejection reason from a moderation comment
 * Expected format: "Rejeté par user@email.com | Raison : "reason text""
 * @param comment The moderation comment
 * @returns The extracted reason or the full comment if parsing fails
 */
export const extractRejectionReason = (comment: string | null): string => {
  if (!comment) {
    return "Raison non spécifiée";
  }

  // Split by "|" to separate different parts
  const parts = comment.split("|");

  // Look for "Raison" with quotes in any part
  for (const part of parts) {
    const trimmedPart = part.trim();

    // Match pattern: Raison : "reason text" (handle escaped quotes)
    const reasonMatch = trimmedPart.match(/Raison\s*:\s*"((?:[^"\\]|\\.)*)"/i);

    if (reasonMatch && reasonMatch[1]) {
      // Unescape any escaped quotes in the captured text
      return reasonMatch[1].replace(/\\"/g, '"');
    }
  }

  // Last fallback: return default reason (never expose moderator identity)
  return "Raison non spécifiée";
};

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
