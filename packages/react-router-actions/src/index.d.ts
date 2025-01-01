import { useFetcher, type ActionFunctionArgs } from 'react-router'

export type ActionsReturnType<T extends Record<string, (args: ActionFunctionArgs) => any>> = {
  [K in keyof T]: ReturnType<T[K]> extends Promise<infer U> ? { action: K; result: U } : { action: K; result: ReturnType<T[K]> }
} & {
  _union: ReturnType<T[keyof T]> extends Promise<infer U> ? U : ReturnType<T[keyof T]>
}

export function actions<T extends Record<string, (args: ActionFunctionArgs) => any>>(actionsDefinition: T): ActionsReturnType<T>

type UseActionOptions<TResult> = {
  onSuccess?: (data: TResult) => void
  onError?: (data: unknown) => void
}

export function useAction<
  Action extends {
    action: string
    result: any
  } = any,
>(
  actionName: Action extends { action: infer ActionName; result: infer ActionResult } ? ActionName | (string & {}) : string,
  options?: UseActionOptions<Action extends { action: any; result: infer ActionResult } ? Awaited<ActionResult> : unknown>,
): ReturnType<typeof useFetcher<Action extends { action: string; result: infer Result } ? Result : any>>
