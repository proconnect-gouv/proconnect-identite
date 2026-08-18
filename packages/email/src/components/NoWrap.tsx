//

import type { PropsWithChildren } from "@kitajs/html";

//

export function NoWrap(attributes: PropsWithChildren<JSX.HtmlTag>) {
  const { children, style, ...props } = attributes;

  return (
    <span style={{ whiteSpace: "nowrap", ...(style as object) }} {...props}>
      {children}
    </span>
  );
}
