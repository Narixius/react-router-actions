import { useCallback, type ComponentProps } from 'react'
import { useFetcher, type ActionFunctionArgs } from 'react-router'

type ActionsReturnType<T extends Record<string, (args: ActionFunctionArgs) => any>> = {
  [K in keyof T]: ReturnType<T[K]> extends Promise<infer U> ? { action: K; result: U } : { action: K; result: ReturnType<T[K]> }
} & {
  _union: ReturnType<T[keyof T]> extends Promise<infer U> ? U : ReturnType<T[keyof T]>
}

export function actions<T extends Record<string, (args: ActionFunctionArgs) => any>>(actionsDefinition: T): ActionsReturnType<T> {
  const executor = async (args: ActionFunctionArgs) => {
    const req = args.request.clone()
    const actionName = (await req.formData()).get('_a') as keyof T

    if (!actionsDefinition[actionName]) {
      throw new Error(`Action "${String(actionName)}" is not defined.`)
    }

    return actionsDefinition[actionName](args)
  }

  return executor as unknown as ActionsReturnType<T>
}

export const useAction = <Action extends { action: string; result: any } = any>(actionName: Action extends { action: infer ActionName; result: any } ? ActionName | (string & {}) : string) => {
  type ActionResult = Action extends { action: string; result: infer Result } ? Result : any
  const fetcher = useFetcher<ActionResult>()
  const Form = useCallback(
    function ActionForm(props: ComponentProps<typeof fetcher.Form>) {
      return (
        <fetcher.Form {...props} method={props.method || 'POST'}>
          <input name="_a" value={actionName as string} type="hidden" />
          {props.children}
        </fetcher.Form>
      )
    },
    [actionName],
  )
  return { ...fetcher, Form }
}
