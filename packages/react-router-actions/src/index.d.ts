import type { Infer, Schema } from '@typeschema/all'
import { useFetcher, type ActionFunctionArgs } from 'react-router'

type ActionsReturnType<T extends Record<string, (args: ActionFunctionArgs) => any>> = {
  [K in keyof T]: ReturnType<T[K]> extends ValidatedActionReturn<infer U, infer F>
    ? { action: K; result: U; fields: F }
    : ReturnType<T[K]> extends Promise<infer U>
    ? { action: K; result: U }
    : { action: K; result: Awaited<ReturnType<T[K]>> }
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
): ReturnType<typeof useFetcher<Action extends { action: string; result: infer Result } ? Result : any>> & {
  errors: Action extends { action: any; fields: infer Fields } ? Record<keyof Fields | (string & {}), string> : any
}

type InputFn<ActionArgs, TSchema> = (args: ActionArgs) => Promise<TSchema> | TSchema

export type ValidatedActionOptions<ActionArgs extends ActionFunctionArgs = ActionFunctionArgs, TSchema extends Schema = Schema, TReturn = unknown> = {
  input: TSchema | InputFn<ActionArgs, TSchema>
  handler: (args: ActionArgs, body: Infer<TSchema>) => TReturn
}

type ValidatedActionReturn<Result, TSchema> = Promise<Result>

export function validatedAction<ActionArgs extends ActionFunctionArgs, TSchema extends Schema, TResult extends any>(
  validatedActionOptions: ValidatedActionOptions<ActionArgs, TSchema, TResult>,
): (args: ActionArgs) => ValidatedActionReturn<TResult, Infer<TSchema>>
