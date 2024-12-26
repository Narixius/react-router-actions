import { type ActionFunctionArgs, useFetcher } from 'react-router'

type ActionsReturnType<T extends Record<string, (args: ActionFunctionArgs) => any>> = {
  [K in keyof T]: ReturnType<T[K]> extends Promise<infer U> ? { action: K; result: U } : { action: K; result: ReturnType<T[K]> }
} & {
  _union: ReturnType<T[keyof T]> extends Promise<infer U> ? U : ReturnType<T[keyof T]>
}

export function actions<T extends Record<string, (args: ActionFunctionArgs) => any>>(actionsDefinition: T): ActionsReturnType<T>

export function useAction<
  Action extends {
    action: string
    result: any
  } = any,
>(
  actionName: Action extends {
    action: infer ActionName
    result: any
  }
    ? ActionName | (string & {})
    : string,
): ReturnType<typeof useFetcher<Action extends { action: string; result: infer Result } ? Result : any>>
