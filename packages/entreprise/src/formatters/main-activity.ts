//

import type { InseeMainActivityEstablishment } from "#src/types";

//

export function formatMainActivity(activity: InseeMainActivityEstablishment) {
  if (!activity.code) return "Activité inconnue";
  return `${activity.code} - ${activity.libelle}`;
}
