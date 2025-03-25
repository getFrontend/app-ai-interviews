import Logo from "../Logo";

interface AuthHeaderProps {
  title: string;
}

const AuthHeader = ({ title }: AuthHeaderProps) => {
  return (
    <>
      <Logo className="justify-center" />    
      <h3 className="text-center">{title}</h3>
    </>
  );
};

export default AuthHeader;