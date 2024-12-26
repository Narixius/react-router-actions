import { useLoaderData } from 'react-router'
import { actions, useAction } from 'react-router-actions'
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
  addTodo: async ctx => {
    const form = await ctx.request.formData()
    todos.push({
      title: form.get('title')!.toString(),
      done: false,
    })
    return { ok: true }
  },
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

export const loader = () => {
  return todos
}

/*
  success/error callback
  add addCustomActionPath (to the userAction like useAction('name', {action: '/dashboard'})) or to the form <action.Form action='/somewhere' />

  create readme
  no-js environment compatible
  0 dependency
*/

export default function Home() {
  const todos = useLoaderData<typeof loader>()
  const addTodo = useAction('addTodo')
  const removeTodo = useAction('removeTodo')
  const toggleTodo = useAction('toggleTodo')

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
