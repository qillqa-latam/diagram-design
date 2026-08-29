export class Resvg {
  constructor(_svg?: string, _opts?: any) {}
  render() {
    return {
      asPng: () => new Uint8Array()
    };
  }
}
