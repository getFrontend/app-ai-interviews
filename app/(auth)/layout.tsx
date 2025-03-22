import { ReactNode } from 'react'

const AuthLayout = ({children }: {children: ReactNode}) => {
  return (
    <div>{children}</div>
  )
}

export default AuthLayout