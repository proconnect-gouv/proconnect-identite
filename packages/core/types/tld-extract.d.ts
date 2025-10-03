//

declare module "tld-extract" {
  function parse_host(
    domain: string,
    { allowDotlessTLD: boolean },
  ): {
    tld: string;
    domain: string;
    sub: string;
  };
}
