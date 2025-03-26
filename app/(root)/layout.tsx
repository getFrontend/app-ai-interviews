import { ReactNode } from 'react'
import { redirect } from "next/navigation";

import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth.action";
import SignOutButton from '@/components/SignOutButton';
import Logo from '@/components/Logo';
import AvatarPicker from '@/components/avatar/AvatarPicker';

const RootLayout = async ({children }: {children: ReactNode}) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");
  
  // Get current user data
  const user = await getCurrentUser();

  // Default avatar path if user doesn't have one set
  const userAvatar = user?.photoURL || "/user-avatar.jpg";

  return (
    <div className="root-layout">
      <nav className='w-full flex justify-between items-center'>
        <Logo link />
        
        {/* User profile section */}
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-light-100 text-lg font-medium">{user.name}</span>
            <AvatarPicker 
              currentAvatar={userAvatar}
              userId={user.id}
              userName={user.name}
            />
            <SignOutButton />
          </div>
        )}
      </nav>

      {children}
    </div>
  )
}

export default RootLayout