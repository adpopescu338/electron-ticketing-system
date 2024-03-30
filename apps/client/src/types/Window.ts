export type VariablesFromBackend = {
  addresses: string[]; // ip addresses for server
};

declare global {
  interface Window {
    variables: VariablesFromBackend;
  }
}
