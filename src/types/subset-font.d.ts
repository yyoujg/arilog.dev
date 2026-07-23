declare module "subset-font" {
  interface SubsetFontOptions {
    targetFormat?: "sfnt" | "woff" | "woff2" | "truetype";
    preserveNameIds?: number[];
    variationAxes?: Record<string, number>;
    noLayoutClosure?: boolean;
  }

  export default function subsetFont(
    font: Buffer | Uint8Array,
    text: string,
    options?: SubsetFontOptions,
  ): Promise<Buffer>;
}
