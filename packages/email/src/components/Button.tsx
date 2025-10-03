//

import type { PropsWithChildren } from "@kitajs/html";
import { blueFranceSun_113, fontFamily } from "./style";

//

export function Button(attributes: PropsWithChildren<JSX.HtmlLinkTag>) {
  const { children, style, ...props } = attributes;

  return (
    <a
      style={{
        backgroundColor: blueFranceSun_113,
        borderRadius: "4px",
        color: "white",
        display: "block",
        fontFamily,
        fontSize: "16px",
        fontStyle: "normal",
        fontWeight: "bold",
        lineHeight: "24px",
        padding: "5px",
        textAlign: "center",
        textDecoration: "none",
        wordBreak: "break-word",
        wordWrap: "break-word",
        margin: 0,
        ...(style as object),
      }}
      target="_blank"
      {...props}
    >
      {children}
    </a>
  );
}
