import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'
import { redirect } from "next/navigation";

import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth.action";
import SignOutButton from '@/components/SignOutButton';

const RootLayout = async ({children }: {children: ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");
  
  // Get current user data
  const user = await getCurrentUser();

  return (
    <div className="root-layout">
      <nav className='w-full flex justify-between items-center'>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo-4.png" alt="PYTAI logo" width={84} height={39} />
          <span className="hidden sm:block text-primary-100 text-2xl sm:text-[38px] font-bold">PYTAI</span>
        </Link>
        
        {/* User profile section */}
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-light-100 text-lg font-medium">{user.name}</span>
            <div className="bg-dark-200 rounded-full p-0.5 border border-primary-200/30">
              <Image 
                src="/user-avatar.png" 
                alt="User avatar" 
                width={40} 
                height={40} 
                className="rounded-full object-cover size-[40px]"
              />
            </div>
            <SignOutButton />
          </div>
        )}
      </nav>

      {children}
    </div>
  )
}

export default RootLayout