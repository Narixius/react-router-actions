import { Infer, Schema, validate } from '@typeschema/all'
import { type ActionFunctionArgs, data } from 'react-router'
import { parseFormDataToObject } from './lib/form-parser'

type InputFn<ActionArgs, TSchema> = (args: ActionArgs) => Promise<TSchema> | TSchema

type ValidatedActionOptions<ActionArgs extends ActionFunctionArgs = ActionFunctionArgs, TSchema extends Schema = Schema, TReturn = unknown> = {
  input: TSchema | InputFn<ActionArgs, TSchema>
  handler: (args: ActionArgs, body: Infer<TSchema>) => TReturn
}

export const validatedAction = <ActionArgs extends ActionFunctionArgs, TSchema extends Schema, TResult extends any>(
  validatedActionOptions: ValidatedActionOptions<ActionArgs, TSchema, TResult>,
): ((args: ActionArgs) => Promise<TResult>) => {
  return async (args: ActionArgs) => {
    const schema = typeof validatedActionOptions.input === 'function' ? await (validatedActionOptions.input as InputFn<ActionArgs, TSchema>)(args) : (validatedActionOptions.input as TSchema)

    const req = args.request.clone()
    const contentType = req.headers.get('content-type') || ''
    let formData: any = {}
    if (['multipart/form-data', 'application/x-www-form-urlencoded'].some(value => contentType.includes(value))) {
      formData = parseFormDataToObject(await req.formData())
    } else if (contentType?.includes('application/json')) {
      formData = await req.json()
    }

    const validation = await validate(schema, formData)
    if (!validation.success) return data(validation.issues, { status: 400 }) as TResult
    return validatedActionOptions.handler(args, validation.data)
  }
}
