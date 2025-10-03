//

export function isNameValid(name: string) {
  return !!name.match(/^[^$&+:;=?@#|<>.^*()%!\d_\[\]{}\\\/"`~]*$/);
}
