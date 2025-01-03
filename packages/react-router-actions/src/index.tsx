import { Infer, Schema, validate } from '@typeschema/all'
import { set } from 'lodash-es'
import { startTransition, useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from 'react'
import { data, Form as ReactRouterForm, useActionData, useFetcher, useFormAction, useSearchParams, type ActionFunctionArgs } from 'react-router'
import { getQuery, parsePath, withQuery } from 'ufo'
import { parseFormDataToObject } from './lib/form-parser'
type InputFn<ActionArgs, TSchema> = (args: ActionArgs) => Promise<TSchema> | TSchema

type ValidatedActionOptions<ActionArgs extends ActionFunctionArgs = ActionFunctionArgs, TSchema extends Schema = Schema, TReturn = unknown> = {
  input: TSchema | InputFn<ActionArgs, TSchema>
  handler: (args: ActionArgs, body: Infer<TSchema>) => TReturn
}

type ActionsReturnType<T extends Record<string, (args: ActionFunctionArgs) => any>> = {
  [K in keyof T]: ReturnType<T[K]> extends ValidatedActionReturn<infer U, infer F>
    ? { action: K; result: U; fields: F }
    : ReturnType<T[K]> extends Promise<infer U>
    ? { action: K; result: U }
    : { action: K; result: Awaited<ReturnType<T[K]>> }
} & {
  _union: ReturnType<T[keyof T]> extends Promise<infer U> ? U : ReturnType<T[keyof T]>
}

export function actions<T extends Record<string, (args: ActionFunctionArgs) => any>>(actionsDefinition: T): ActionsReturnType<T> {
  const executor = async (args: ActionFunctionArgs) => {
    const req = args.request
    const parsedPath = parsePath(req.url)
    const query = new URLSearchParams(parsedPath.search)
    const actionName = (query.get('_action') || '').toString()
    if (!actionsDefinition[actionName]) {
      throw new Error(`Action "${String(actionName)}" is not defined.`)
    }
    return actionsDefinition[actionName](args)
  }

  return executor as unknown as ActionsReturnType<T>
}

type UseActionOptions<TResult> = {
  onSuccess?: (data: TResult) => void
  onError?: (data: unknown) => void
}

const getError = (data: any) => {
  let errors = {}
  if (data && data['validationErrors'])
    data['validationErrors'].forEach((fieldError: { message: string; path: string[] }) => {
      set(errors, fieldError.path, fieldError.message)
    })
  return errors
}

export const useAction = <Action extends { action: string; result: any; fields?: any } = any>(
  actionName: Action extends { action: infer ActionName; result: infer ActionResult } ? ActionName | (string & {}) : string,
  options?: UseActionOptions<Action extends { action: any; result: infer ActionResult } ? ActionResult : unknown>,
): ReturnType<typeof useFetcher<Action extends { action: string; result: infer Result } ? Result : any>> & {
  errors: Action extends { action: any; fields: infer Fields } ? Record<keyof Fields | (string & {}), string> : any
} => {
  type TErrors = Action extends { action: any; fields: infer Fields } ? Record<keyof Fields | (string & {}), string> : any
  const currentActionPath = useFormAction()
  const [queryParams] = useSearchParams()
  const actionData = useActionData()
  const fetcher = useFetcher()
  const prevState = useRef(fetcher.state)
  const data = (!!(queryParams.get('_action')?.toString() && queryParams.get('_action')?.toString() === actionName) ? actionData : undefined) || fetcher.data
  const [errors, setErrors] = useState<TErrors>(getError(data) as TErrors)

  useEffect(() => {
    const prevFetcherState = prevState.current
    let data = fetcher.data
    let isDataWithResponseInit = false
    if (fetcher.data?.type === 'DataWithResponseInit') {
      data = data.data
      isDataWithResponseInit = true
    }
    if ((prevFetcherState === 'submitting' && fetcher.state !== 'loading') || isDataWithResponseInit) {
      if (data && 'validationErrors' in data) {
        let errors = getError(data)
        setErrors(errors as unknown as TErrors)
        if (options?.onError) {
          options.onError(errors)
        }
      } else {
        startTransition(() => {
          setErrors({} as TErrors)
        })
        if (options?.onSuccess) {
          options.onSuccess(data)
        }
      }
    }
  }, [fetcher.data])

  const actionPath = useMemo(() => {
    const query = getQuery(currentActionPath)
    query._action = actionName
    return withQuery(parsePath(currentActionPath).pathname, query)
  }, [currentActionPath, actionName])

  const Form = useCallback(
    function ActionForm(props: ComponentProps<typeof ReactRouterForm>) {
      return (
        <fetcher.Form
          action={actionPath}
          method={props.method || 'POST'}
          {...props}
          onSubmit={(...args) => {
            prevState.current = 'submitting'
            props.onSubmit?.(...args)
          }}
        >
          {props.children}
        </fetcher.Form>
      )
    },
    [actionPath],
  )
  // @ts-ignore
  return { ...fetcher, Form, data, errors }
}

type ValidatedActionReturn<Result, TSchema> = Promise<Result>

export const validatedAction = <ActionArgs extends ActionFunctionArgs, TSchema extends Schema, TResult extends any>(
  validatedActionOptions: ValidatedActionOptions<ActionArgs, TSchema, TResult>,
): ((args: ActionArgs) => ValidatedActionReturn<TResult, TSchema>) => {
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
    if (!validation.success) return data({ validationErrors: validation.issues }, { status: 400 }) as TResult
    return validatedActionOptions.handler(args, validation.data)
  }
}
