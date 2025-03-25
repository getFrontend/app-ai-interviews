import Image from "next/image";

interface AuthHeaderProps {
  title: string;
}

const AuthHeader = ({ title }: AuthHeaderProps) => {
  return (
    <>
     <div className="flex items-center justify-center gap-2">
        <Image src="/logo-4.png" alt="PYTAI logo" width={84} height={39} />
        <span className="hidden sm:block text-primary-100 text-2xl sm:text-[38px] font-bold">PYTAI</span>
      </div>
      
      <h3 className="text-center">{title}</h3>
    </>
  );
};

export default AuthHeader;