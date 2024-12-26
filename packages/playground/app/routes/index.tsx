import { actions, useAction } from 'react-router-actions'
import type { Route } from './+types/index'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'New React Router App' }, { name: 'description', content: 'Welcome to React Router!' }]
}

export const action = actions({
  login: () => {
    return { ok: true }
  },
  logout: async () => {
    return { message: 'Logged out' }
  },
})

export default function Home() {
  const login = useAction<(typeof action)['login']>('login')

  return (
    <login.Form method="POST">
      <button className="border border-red-200 text-red-500" type="submit">
        call action
      </button>
      <br />
      date time
      {JSON.stringify(login.data)}
    </login.Form>
  )
}
