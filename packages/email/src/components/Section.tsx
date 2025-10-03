//

import type { PropsWithChildren } from "@kitajs/html";

//

export function Section(attributes: PropsWithChildren<JSX.HtmlTableTag>) {
  const { align, children, style, ...props } = attributes;

  return (
    <table
      align="center"
      width="100%"
      {...props}
      border={0}
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style={style ?? ""}
    >
      <tbody>
        <tr>
          <td align={align}>{children}</td>
        </tr>
      </tbody>
    </table>
  );
}
