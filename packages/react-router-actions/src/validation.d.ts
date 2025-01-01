import type { Infer, Schema } from '@typeschema/all'
import { type ActionFunctionArgs } from 'react-router'

type InputFn<ActionArgs, TSchema> = (args: ActionArgs) => Promise<TSchema> | TSchema

export type ValidatedActionOptions<ActionArgs extends ActionFunctionArgs = ActionFunctionArgs, TSchema extends Schema = Schema, TReturn = unknown> = {
  input: TSchema | InputFn<ActionArgs, TSchema>
  handler: (args: ActionArgs, body: Infer<TSchema>) => TReturn
}

export function validatedAction<ActionArgs extends ActionFunctionArgs, TSchema extends Schema, TResult extends any>(
  validatedActionOptions: ValidatedActionOptions<ActionArgs, TSchema, TResult>,
): (args: ActionArgs) => Promise<TResult>
