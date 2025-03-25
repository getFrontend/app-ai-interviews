import Image from 'next/image'
import { ReactNode } from 'react'
import { redirect } from "next/navigation";

import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth.action";
import SignOutButton from '@/components/SignOutButton';
import Logo from '@/components/Logo';

const RootLayout = async ({children }: {children: ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");
  
  // Get current user data
  const user = await getCurrentUser();

  return (
    <div className="root-layout">
      <nav className='w-full flex justify-between items-center'>
        <Logo link />
        
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