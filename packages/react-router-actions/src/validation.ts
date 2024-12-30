import { Infer, Schema, validate } from '@typeschema/main'
import { type ActionFunctionArgs } from 'react-router'

type ValidatedActionOptions<ActionArgs extends ActionFunctionArgs = ActionFunctionArgs, TSchema extends Schema = Schema, TReturn = unknown> = {
  input: TSchema | ((args: ActionArgs) => Promise<TSchema> | TSchema)
  handler: (args: ActionArgs, body: Infer<TSchema>) => TReturn
}

export const validatedAction = <ActionArgs extends ActionFunctionArgs, TSchema extends Schema, TResult extends any>(
  validatedActionOptions: ValidatedActionOptions<ActionArgs, TSchema, TResult>,
): ((args: ActionArgs) => Promise<TResult>) => {
  return async (args: ActionArgs) => {
    const schema = typeof validatedActionOptions.input === 'function' ? await validatedActionOptions.input(args) : validatedActionOptions.input
    // TODO: convert form data to object
    const data = validate(schema, {}) as Infer<TSchema>
    return validatedActionOptions.handler(args, data)
  }
}
