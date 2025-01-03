import type { FC, PropsWithChildren } from 'react'

export const ErrorMessage: FC<PropsWithChildren> = ({ children }) => {
  return <span className="text-red-400 text-sm">{children}</span>
}
