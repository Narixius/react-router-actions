import type { Infer, Schema } from '@typeschema/main'
import { type ActionFunctionArgs } from 'react-router'

type ValidatedActionOptions<ActionArgs extends ActionFunctionArgs = ActionFunctionArgs, TSchema extends Schema = Schema, TReturn = unknown> = {
  input: TSchema | ((args: ActionArgs) => Promise<TSchema> | TSchema)
  handler: (args: ActionArgs, body: Infer<TSchema>) => TReturn
}

export function validatedAction<ActionArgs extends ActionFunctionArgs, TSchema extends Schema, TResult extends any>(
  validatedActionOptions: ValidatedActionOptions<ActionArgs, TSchema, TResult>,
): (args: ActionArgs) => Promise<TResult>
