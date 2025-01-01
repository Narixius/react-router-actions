import { set } from 'lodash-es'
import { useCallback, useEffect, useMemo, useRef, type ComponentProps } from 'react'
import { Form as ReactRouterForm, useActionData, useFetcher, useFormAction, useSearchParams, type ActionFunctionArgs } from 'react-router'
import { addQueryParams, parsePath } from './lib/query'

type ActionsReturnType<T extends Record<string, (args: ActionFunctionArgs) => any>> = {
  [K in keyof T]: ReturnType<T[K]> extends Promise<infer U> ? { action: K; result: U } : { action: K; result: ReturnType<T[K]> }
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

export const useAction = <Action extends { action: string; result: any } = any>(
  actionName: Action extends { action: infer ActionName; result: infer ActionResult } ? ActionName | (string & {}) : string,
  options?: UseActionOptions<Action extends { action: any; result: infer ActionResult } ? ActionResult : unknown>,
) => {
  const currentActionPath = useFormAction()
  const [queryParams] = useSearchParams()
  const actionData = useActionData()
  const fetcher = useFetcher()
  const prevState = useRef(fetcher.state)

  const data = (!!(queryParams.get('_action')?.toString() && queryParams.get('_action')?.toString() === actionName) ? actionData : undefined) || fetcher.data

  useEffect(() => {
    const prevFetcherState = prevState.current
    if (prevFetcherState === 'submitting' && fetcher.state === 'loading') {
      if ('validationErrors' in fetcher.data) {
        if (options?.onError) {
          let errors = {}
          if (fetcher.data['validationErrors'])
            fetcher.data['validationErrors'].forEach((fieldError: { message: string; path: string[] }) => {
              set(errors, fieldError.path, fieldError.message)
            })
          options.onError(errors)
        }
      } else {
        if (options?.onSuccess) {
          options.onSuccess(data)
        }
      }
    }
    prevState.current = fetcher.state
  }, [fetcher.state, options?.onSuccess])

  const actionPath = useMemo(() => {
    return addQueryParams(currentActionPath, { _action: actionName })
  }, [currentActionPath, actionName])

  const Form = useCallback(
    function ActionForm(props: ComponentProps<typeof ReactRouterForm>) {
      return (
        <fetcher.Form action={actionPath} method={props.method || 'POST'} {...props}>
          {props.children}
        </fetcher.Form>
      )
    },
    [actionPath],
  )
  return { ...fetcher, Form, data }
}
