import Image from "next/image";

interface AuthHeaderProps {
  title: string;
}

const AuthHeader = ({ title }: AuthHeaderProps) => {
  return (
    <>
      <div className="flex items-center justify-center">
        <Image src="/logo-auth.png" alt="PYTAI logo" width={140} height={50} />
      </div>
      <h3 className="text-center">{title}</h3>
    </>
  );
};

export default AuthHeader;