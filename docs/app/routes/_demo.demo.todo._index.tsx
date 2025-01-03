import { parse, serialize } from 'cookie-es'
import { Trash2Icon } from 'lucide-react'
import { data, useLoaderData, type LoaderFunctionArgs } from 'react-router'
import { actions, useAction, validatedAction } from 'react-router-actions'
import { z } from 'zod'
import { ErrorMessage } from '~/components/ui/ErrorMessage'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Input } from '~/components/ui/input'
import { cn } from '~/lib/utils'

/* remove-on-demo-start */
import { useMemo } from 'react'
import { renderSyntax } from '~/components/highlighter.server'
import fileContens from './_demo.demo.todo._index.tsx?raw'
/* remove-on-demo-end */

type TodoItem = {
  title: string
  done: boolean
}

const todos: TodoItem[] = typeof document !== 'undefined' && document.cookie ? JSON.parse(parse(document.cookie).todos) || [] : []

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const cookies = request.headers.get('cookie')
  const parsedCookies = parse(cookies || '')
  const todos = JSON.parse(parsedCookies.todos || '[]')
  return {
    /* remove-on-demo-start */
    code: await renderSyntax(fileContens),
    /* remove-on-demo-end */
    todos: context.todos || todos,
  }
}

export const action = actions({
  addTodo: validatedAction({
    input: () =>
      z.object({
        title: z
          .string()
          .nonempty()
          .refine(title => !todos.some(todo => todo.title === title), { message: 'Duplicated todo' }),
      }),
    handler: async (args, input) => {
      const cookies = args.request.headers.get('cookie')
      const parsedCookies = parse(cookies || '')
      const todos = JSON.parse(parsedCookies.todos || '[]')
      todos.push({
        title: input.title,
        done: false,
      })
      args.context.todos = todos
      return data(
        { ok: true },
        {
          headers: {
            'set-cookie': serialize('todos', JSON.stringify(todos)),
          },
        },
      )
    },
  }),
  removeTodo: validatedAction({
    input: z.object({
      index: z.string(),
    }),
    handler: async (args, body) => {
      const index = body.index
      const cookies = args.request.headers.get('cookie')
      const parsedCookies = parse(cookies || '')
      const todos = JSON.parse(parsedCookies.todos || '[]')
      todos.splice(parseInt(index), 1)
      args.context.todos = todos
      return data(
        { ok: true },
        {
          headers: {
            'set-cookie': serialize('todos', JSON.stringify(todos)),
          },
        },
      )
    },
  }),
  toggleTodo: async args => {
    const cookies = args.request.headers.get('cookie')
    const parsedCookies = parse(cookies || '')
    const todos = JSON.parse(parsedCookies.todos || '[]')
    const form = await args.request.formData()
    const index = form.get('index')!.toString()
    const toggleValue = form.get('toggle')!.toString() == '1'
    todos[parseInt(index)].done = toggleValue
    args.context.todos = todos
    return data(
      { ok: true },
      {
        headers: {
          'set-cookie': serialize('todos', JSON.stringify(todos)),
        },
      },
    )
  },
})

type Actions = typeof action

export default function TodoApp() {
  const { todos /* remove-on-demo-start */, code: initialCode /* remove-on-demo-end */ } = useLoaderData()
  /* remove-on-demo-start */
  const code = useMemo(() => initialCode, [])
  /* remove-on-demo-end */
  const addTodo = useAction<Actions['addTodo']>('addTodo', {
    onSuccess() {
      try {
        ;(document.querySelector('input[name="title"]')! as HTMLInputElement).value = ''
      } catch (e) {
        console.error(e)
      }
    },
  })
  const removeTodo = useAction<Actions['removeTodo']>('removeTodo')
  const toggleTodo = useAction<Actions['toggleTodo']>('toggleTodo')

  return (
    <div className="flex flex-col h-full flex-grow overflow-auto">
      {/* remove-on-demo-start */}
      <span>Todo App</span>
      {/* remove-on-demo-end */}
      <div className="gap-2 flex-grow overflow-auto grid grid-cols-2">
        {/* remove-on-demo-start */}
        <div dangerouslySetInnerHTML={{ __html: code }} className=" overflow-auto rounded-md"></div>
        {/* remove-on-demo-end */}
        <div className=" h-full flex flex-col gap-2 flex-grow">
          <div className="max-h-1/2 h-1/2 flex-grow sticky top-2 w-full justify-start items-center flex flex-col">
            <div className="flex flex-col items-center justify-center w-[300px] gap-2">
              <addTodo.Form method="POST" className="flex gap-2 items-start w-full">
                <div className="flex flex-col w-full">
                  <Input className="w-full" name="title" />
                  {addTodo.errors.title && <ErrorMessage>{addTodo.errors.title}</ErrorMessage>}
                </div>
                <Button>Add</Button>
              </addTodo.Form>
              {todos.length === 0 && <span className="w-full text-start block text-muted-foreground">No todos</span>}
              {!!todos.length && <span className="w-full text-start block">Todos: </span>}
              <div className="flex flex-col gap-2 w-full">
                {todos.map((todo: any, index: any) => {
                  return (
                    <div key={index} className={cn('group flex gap-2 w-full justify-between items-center rounded-md px-3 py-2 border border-gray-200', { done: todo.done })}>
                      <div className="flex gap-2">
                        <toggleTodo.Form className="flex flex-col items-center justify-center">
                          <input type="hidden" value={index} name="index" />
                          <input type="hidden" value={todo.done ? '0' : '1'} name="toggle" />
                          <Checkbox type="submit" checked={todo.done} />
                        </toggleTodo.Form>

                        <span className="group-[.done]:line-through group-[.done]:text-muted-foreground">{todo.title}</span>
                      </div>

                      <removeTodo.Form className="group-hover:opacity-100 opacity-0">
                        <input type="hidden" value={index} name="index" />
                        <Button size="icon" variant="ghost-destructive">
                          <Trash2Icon />
                        </Button>
                      </removeTodo.Form>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          {/* remove-on-demo-start */}
          <div className="max-h-1/2 h-1/2 flex flex-col">
            <span className="text-muted-foreground">Description:</span>
            <pre className="flex-grow overflow-auto border border-gray-500 p-2 rounded-md bg-[#22272E] [&>code]:bg-gray-600 [&>code]:px-1 [&>code]:rounded-sm text-[#ACBAC7] text-wrap">
              This demo utilizes <code>react-router-actions</code> to define multiple actions (<code>addTodo</code>, <code>removeTodo</code>, <code>toggleTodo</code>) on a single route action.
              <br />
              <br />
              These actions are used to manage the state of the todo list, allowing users to add, remove, and toggle the completion status of todos.
              <br />
              <br />
              The <code>useLoaderData</code> hook is used to fetch the initial data for the todos and other necessary information from the loader. <br />
              <br />
              The <code>useAction</code> hook from <code>react-router-actions</code> is used to define the actions with their integrated respective handlers.
              <br />
              <br />- <code>addTodo</code>: This action is used to add a new todo item.
              <br />- <code>removeTodo</code>: This action is used to remove an existing todo item.
              <br />- <code>toggleTodo</code>: This action is used to toggle the completion status of a todo item.
              <br />
              <br />
              The <code>addTodo</code> and the <code>removeTodo</code> are defined with <code>validatedAction</code> to validate the input data before processing the action.
              <br />
              <br />
              *Motivation*: As we are using server-side action/loader this example works correct even when JS is disabled.
              <br />
            </pre>
          </div>
          {/* remove-on-demo-end */}
        </div>
      </div>
    </div>
  )
}
