import { Link, Outlet } from 'react-router'

export default function DemoLayout() {
  return (
    <div className="max-h-screen min-h-screen relative flex flex-col p-2">
      <div className="flex gap-2">
        <span>Demo apps:</span>
        <Link to="/demo/todo" className="text-blue-500">
          Todo
        </Link>
        <Link to="/demo/dashboard" className="text-blue-500">
          Dashboard
        </Link>
      </div>
      <Outlet />
    </div>
  )
}
