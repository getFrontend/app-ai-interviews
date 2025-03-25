import Link from "next/link";
import { Github } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-6 p-4 border-t border-dark-300">
      <div className="flex justify-between items-center">
        <p className="text-light-300 text-sm">
          © {currentYear} PYTAI. All rights reserved.
        </p>
        
        <Link 
          href="https://github.com/getFrontend" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-light-300 hover:text-primary-100 transition-colors"
          aria-label="GitHub Repository"
        >
          <Github size={24} />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;