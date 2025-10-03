//

import type { PropsWithChildren } from "@kitajs/html";
import { blueFranceSun_113, fontFamily } from "./style";

//

export function Em(attributes: PropsWithChildren<JSX.HtmlTag>) {
  const { children, style, ...props } = attributes;

  return (
    <em
      style={{
        color: blueFranceSun_113,
        fontFamily,
        fontSize: "16px",
        fontStyle: "normal",
        fontWeight: "bold",
        lineHeight: "24px",
        margin: 0,
        ...(style as object),
      }}
      {...props}
    >
      {children}
    </em>
  );
}
