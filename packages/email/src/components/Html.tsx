//

import type { PropsWithChildren } from "@kitajs/html";

//

export function Html(attributes: PropsWithChildren<JSX.HtmlHtmlTag>) {
  const { children, ...props } = attributes;
  return (
    <html {...props}>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ backgroundColor: "#FAFAFA", paddingTop: "32px" }}>
        <table
          width="100%"
          border={0}
          cellpadding="0"
          cellspacing="0"
          bgcolor="#FAFAFA"
        >
          <tr>
            <td align="center" valign="top">
              {children}
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
