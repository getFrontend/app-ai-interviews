import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
}

const AuthCard = ({ children }: AuthCardProps) => {
  return (
    <div className="card-border md:w-[450px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        {children}
      </div>
    </div>
  );
};

export default AuthCard;