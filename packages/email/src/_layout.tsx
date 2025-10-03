//

import type { PropsWithChildren } from "@kitajs/html";
import { Html, ProConnectLogo, Section, Text } from "./components";

//

export interface LayoutProps {
  baseurl: string;
}

export function VSpacing({ height }: { height: number }) {
  return (
    <Section style={`font-size:${height}px; line-height:${height}px;`}>
      &nbsp;
    </Section>
  );
}
export function Layout({ children }: PropsWithChildren<LayoutProps>) {
  return (
    <Html>
      <Section
        width="800"
        style={{
          maxWidth: "800px",
          width: "100%",
        }}
      >
        <VSpacing height={64} />

        <Section align="center">
          <ProConnectLogo />
        </Section>

        <VSpacing height={64} />

        <Section
          bgcolor="#FFFFFF"
          style={{
            boxShadow: "0px 2px 6px 0px rgba(0, 0, 18, 0.16)",
          }}
        >
          <VSpacing height={64} />

          <Section
            width="600"
            style={{
              maxWidth: "600px",
              width: "100%",
              padding: "24px",
            }}
          >
            {children}

            <Text style={{ marginTop: "16px" }}>
              Cordialement,
              <br />
              L'équipe ProConnect
            </Text>
          </Section>

          <VSpacing height={64} />
        </Section>

        <VSpacing height={64} />
      </Section>
      <VSpacing height={64} />
    </Html>
  );
}
