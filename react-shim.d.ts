declare namespace React {
  type FC<P = {}> = (props: P) => JSX.Element;
  type FormEvent<T = any> = any;
  type ChangeEvent<T = any> = any;
  type ReactNode = any;
  const StrictMode: any;
  function useState<T = any>(initial: T | (() => T)): [T, (value: T | ((previous: T) => T)) => void];
  function useEffect(effect: any, deps?: any[]): void;
  function useMemo<T = any>(factory: () => T, deps: any[]): T;
}
declare module 'react' { export = React; }
declare module 'react/jsx-runtime' { export const jsx: any; export const jsxs: any; export const Fragment: any; }
declare module 'react-dom/client' { export const createRoot: any; }
declare namespace JSX { interface Element {} interface IntrinsicElements { [elemName: string]: any; } }
