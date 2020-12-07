export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchHtml(expected: string): R;
    }
  }
}
