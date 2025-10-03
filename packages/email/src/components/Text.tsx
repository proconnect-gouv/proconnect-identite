//

import type { PropsWithChildren } from "@kitajs/html";
import { fontFamily } from "./style";

//

export function Text(attributes: PropsWithChildren<JSX.HtmlTag>) {
  const { children, style, ...props } = attributes;

  return (
    <p
      style={{
        color: "#000",
        fontFamily,
        fontSize: "16px",
        fontWeight: 400,
        lineHeight: "24px",
        margin: 0,
        ...(style as object),
      }}
      {...props}
    >
      {children}
    </p>
  );
}
