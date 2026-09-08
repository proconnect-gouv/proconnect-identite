import moment from "moment";
import "moment-timezone";

export const formatDate = (date: Date): string => {
  return moment(date).tz("Europe/Paris").locale("fr").calendar();
};
