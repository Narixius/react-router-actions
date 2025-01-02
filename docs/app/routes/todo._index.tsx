import { useLoaderData } from 'react-router'
import { actions, useAction, validatedAction } from 'react-router-actions'
import { z } from 'zod'

/* remove-on-demo-start */
import { useMemo } from 'react'
import { renderSyntax } from '~/components/highlighter.server'
import fileContens from './todo._index.tsx?raw'

export const loader = async () => {
  return {
    code: await renderSyntax(fileContens),
    todos: [],
  }
}
/* remove-on-demo-end */

type TodoItem = {
  title: string
  done: boolean
}
const todos: TodoItem[] = []

export const clientAction = actions({
  addTodo: validatedAction({
    input: z.object({
      title: z.string().nonempty(),
    }),
    handler: async (ctx, input) => {
      todos.push({
        title: input.title,
        done: false,
      })
      return { ok: true }
    },
  }),
  removeTodo: validatedAction({
    input: z.object({
      index: z.string(),
    }),
    handler: async (ctx, body) => {
      const index = body.index
      todos.splice(parseInt(index), 1)
      return { ok: true }
    },
  }),
  toggleTodo: async ctx => {
    const form = await ctx.request.formData()
    const index = form.get('index')!.toString()
    const toggleValue = form.get('toggle')!.toString() == '1'
    todos[parseInt(index)].done = toggleValue
    return {
      ok: true,
    }
  },
})

type Actions = typeof clientAction

export const clientLoader = async () => {
  return {
    todos,
  }
}

export default function TodoApp() {
  const { todos /* remove-on-demo-start */, code: initialCode /* remove-on-demo-end */ } = useLoaderData()
  /* remove-on-demo-start */
  const code = useMemo(() => initialCode, [])
  /* remove-on-demo-end */
  const addTodo = useAction<Actions['addTodo']>('addTodo')
  const removeTodo = useAction<Actions['removeTodo']>('removeTodo')
  const toggleTodo = useAction<Actions['toggleTodo']>('toggleTodo')

  return (
    <div className="flex gap-2">
      {/* remove-on-demo-start */}
      <div dangerouslySetInnerHTML={{ __html: code }}></div>
      {/* remove-on-demo-end */}
      <div>
        <div className="flex flex-col">
          <addTodo.Form method="POST" className="flex gap-2">
            <div className="flex flex-col">
              <input name="title" className="border border-gray-300" />
              {addTodo.errors.title && <span>{addTodo.errors.title}</span>}
            </div>
            <button className="border border-gray-300 px-2">add todo</button>
          </addTodo.Form>

          {todos.map((todo: any, index: any) => {
            return (
              <div key={index} className="flex gap-2">
                <toggleTodo.Form>
                  <input type="hidden" value={index} name="index" />
                  <input type="hidden" value={todo.done ? '0' : '1'} name="toggle" />
                  <button>{todo.done ? 'Undo' : 'Done'}</button>
                </toggleTodo.Form>

                {todo.title}

                <removeTodo.Form>
                  <input type="hidden" value={index} name="index" />
                  <button>Delete</button>
                </removeTodo.Form>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
