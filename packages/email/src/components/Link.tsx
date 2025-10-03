//

import type { PropsWithChildren } from "@kitajs/html";
import { fontFamily } from "./style";

//

export function Link(attributes: PropsWithChildren<JSX.HtmlAnchorTag>) {
  const { children, href, ...props } = attributes;
  return (
    <a
      href={href}
      {...props}
      style={{
        color: "rgb(0, 0, 145)",
        fontFamily,
        fontSize: "16px",
        lineHeight: "24px",
        margin: "16px 0",
        textDecoration: "underline",
      }}
    >
      {children}
    </a>
  );
}
