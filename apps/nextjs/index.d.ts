/* biome-ignore-all lint/suspicious/noExplicitAny: SVG module declarations are provided by the bundler. */
declare module "*.svg" {
  const content: any;
  export const ReactComponent: any;
  export default content;
}
