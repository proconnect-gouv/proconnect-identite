//

import type { PropsWithChildren } from "@kitajs/html";
import { fontFamily, info_950 } from "./style";

//

export function Badge(attributes: PropsWithChildren<JSX.HtmlTag>) {
  const { children, style, ...props } = attributes;

  return (
    <span
      style={{
        backgroundColor: info_950,
        fontFamily,
        fontSize: "16px",
        fontStyle: "normal",
        lineHeight: "24px",
        margin: 0,
        padding: "8px 16px",
        ...(style as object),
      }}
      {...props}
    >
      {children}
    </span>
  );
}
