import {
  createContext,
  createComponent,
  useContext,
  JSX,
  Context,
  FlowComponent,
  Accessor,
  untrack,
} from "solid-js";
import type { ContextProviderComponent } from "solid-js/types/reactive/signal";

export type ContextProviderProps = {
  children?: JSX.Element;
} & Record<string, unknown>;
export type ContextProvider<T extends ContextProviderProps> = (
  props: { children: JSX.Element } & T,
) => JSX.Element;

/**
 * Create the Context Provider component and useContext function with types inferred from the factory function.
 * @param factoryFn Factory function will run when the provider component in executed. It takes the provider component `props` as it's argument, and what it returns will be available in the contexts for all the underlying components.
 * @param defaults fallback returned from useContext function if the context wasn't provided
 * @returns tuple of `[provider component, useContext function]`
 * @example
 * ```tsx
 * const [CounterProvider, useCounter] = createContextProvider((props: { initial: number }) => {
 *    const [count, setCount] = createSignal(props.initial);
 *    const increment = () => setCount(count() + 1)
 *    return { count, increment };
 * });
 * // Provide the context
 * <CounterProvider initial={1}>
 *    <App/>
 * </CounterProvider>
 * // get the context
 * const ctx = useCounter()
 * ctx?.count() // => 1
 * ```
 */
export function createContextProvider<T, P extends ContextProviderProps>(
  factoryFn: (props: P) => T,
  defaults: T,
): [provider: ContextProvider<P>, useContext: () => T];
export function createContextProvider<T, P extends ContextProviderProps>(
  factoryFn: (props: P) => T,
): [provider: ContextProvider<P>, useContext: () => T | undefined];
export function createContextProvider<T, P extends ContextProviderProps>(
  factoryFn: (props: P) => T,
  defaults?: T,
): [provider: ContextProvider<P>, useContext: () => T | undefined] {
  const ctx = createContext(defaults);
  return [
    props => {
      return createComponent(ctx.Provider, {
        value: factoryFn(props),
        get children() {
          return props.children;
        },
      });
    },
    () => useContext(ctx),
  ];
}

/*

MultiProvider inspired by the preact-multi-provider package from Marvin Hagemeister
See https://github.com/marvinhagemeister/preact-multi-provider


Type validation of the `values` array thanks to the amazing @otonashixav (https://github.com/otonashixav)

*/

/**
 * A component that allows you to provide multiple contexts at once. It will work exactly like nesting multiple providers as separate components, but it will save you from the nesting.
 *
 * @param values Array of tuples of `[ContextProviderComponent, value]` or `[Context, value]` or bound `ContextProviderComponent` (that doesn't take a `value` property).
 *
 * @example
 * ```tsx
 * // before
 * <CounterCtx.Provider value={1}>
 *   <NameCtx.Provider value="John">
 *     <App/>
 *   </NameCtx.Provider>
 * </CounterCtx.Provider>
 *
 * // after
 * <MultiProvider values={[
 *  [CounterCtx.Provider, 1],
 *  [NameCtx.Provider, "John"]
 * ]}>
 *  <App/>
 * </MultiProvider>
 * ```
 */
export function MultiProvider<T extends readonly [unknown?, ...unknown[]]>(props: {
  values: {
    [K in keyof T]:
      | readonly [
          Context<T[K]> | ContextProviderComponent<T[K]>,
          [T[K]][T extends unknown ? 0 : never],
        ]
      | FlowComponent;
  };
  children: JSX.Element;
}): JSX.Element {
  const { values } = props;
  const fn = (i: number) => {
    let item: any = values[i];

    if (!item) return props.children;

    const ctxProps: { value?: any; children: JSX.Element } = {
      get children() {
        return fn(i + 1);
      },
    };
    if (Array.isArray(item)) {
      ctxProps.value = item[1];
      item = item[0];
      if (typeof item !== "function") item = item.Provider;
    }

    return createComponent(item, ctxProps);
  };
  return fn(0);
}

/**
 * A utility-helper to provide context to unresolved JSX-elements.
 *
 * @param elements Array of tuples of `[ContextProviderComponent, value]` or `[Context, value]` or bound `ContextProviderComponent` (that doesn't take a `value` property).
 * @param values Array of tuples of `[ContextProviderComponent, value]` or `[Context, value]` or bound `ContextProviderComponent` (that doesn't take a `value` property).
 * @param values Array of tuples of `[ContextProviderComponent, value]` or `[Context, value]` or bound `ContextProviderComponent` (that doesn't take a `value` property).
 *
 * @example
 * ```tsx
 * // single context
 * const resolvedChildren = withContext(
 *    () => children(props.children),
 *    CounterContext,
 *    1
 * )
 *
 * // multiple contexts
 * const resolvedChildren = withContext(
 *    () => children(props.children),
 *    [[CounterContext, 1]]
 * ```
 */
export function withContext<T extends unknown, U extends unknown>(
  children: Accessor<U>,
  context: Context<T>,
  value: T,
): U;
export function withContext<T extends [unknown?, ...unknown[]], U extends unknown>(
  children: Accessor<U>,
  contexts: {
    [K in keyof T]: readonly [Context<T[K]>, [T[K]][T extends unknown ? 0 : never]];
  },
): U;
export function withContext<
  T extends any[],
  U extends Element,
  V extends {
    [K in keyof T]: readonly [Context<T[K]>, [T[K]][T extends unknown ? 0 : never]];
  },
>(children: Accessor<U>, contexts: V | Context<T>, value?: T) {
  let result: U;

  let values = Array.isArray(contexts) ? contexts : ([[contexts, value]] as unknown as V);

  const fn = (i: number) => {
    let item: any = values[i];

    if (!item) return (result = children());

    const ctxProps: { value?: any; children: JSX.Element } = {
      get children() {
        return fn(i + 1);
      },
    };
    if (Array.isArray(item)) {
      ctxProps.value = item[1];
      item = item[0];
      if (typeof item !== "function") item = item.Provider;
    }

    return createComponent(item, ctxProps);
  };

  return result!;
}
