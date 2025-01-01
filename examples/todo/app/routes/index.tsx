import { useLoaderData } from 'react-router'
import { actions, useAction } from 'react-router-actions'
import { validatedAction } from 'react-router-actions/validation'
import { z } from 'zod'
import type { Route } from './+types/index'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New React Router App' }, { name: 'description', content: 'Welcome to React Router!' }]
}

type TodoItem = {
  title: string
  done: boolean
}
const todos: TodoItem[] = []

export const action = actions({
  addTodo: validatedAction({
    input: z.object({
      title: z.string().nonempty(),
    }),
    handler: (ctx, body) => {
      todos.push({
        title: body.title,
        done: false,
      })
      return { ok: true }
    },
  }),
  removeTodo: async ctx => {
    const form = await ctx.request.formData()
    const index = form.get('index')!.toString()
    todos.splice(parseInt(index), 1)
    return { ok: true }
  },
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

type Actions = typeof action

export const loader = () => {
  return todos
}

export default function Home() {
  const todos = useLoaderData<typeof loader>()
  const addTodo = useAction<Actions['addTodo']>('addTodo')
  const removeTodo = useAction<Actions['removeTodo']>('removeTodo')
  const toggleTodo = useAction<Actions['toggleTodo']>('toggleTodo')

  return (
    <div className="flex flex-col">
      <addTodo.Form method="POST" className="flex gap-2">
        <input name="title" className="border border-gray-300" />
        <button className="border border-gray-300 px-2">add todo</button>
      </addTodo.Form>
      {todos.map((todo, index) => {
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
  )
}