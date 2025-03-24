import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";

const RootLayout = async ({children }: {children: ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="root-layout">
      <nav className='w-full'>
        <Link href="/" className="w-1/5 flex items-center gap-2">
          <Image src="/logo-4.png" alt="PYTAI" width={84} height={39} />
          <span className="text-primary-100 text-2xl sm:text-[38px] font-bold">PYTAI</span>
        </Link>
      </nav>

      {children}
    </div>
  )
}

export default RootLayout