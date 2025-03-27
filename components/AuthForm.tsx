"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Form} from "@/components/ui/form"
import Link from "next/link";
import {toast} from "sonner";
import FormField from "@/components/FormField";
import {useRouter} from "next/navigation";
import {
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  reload,
  signInWithPopup,
  GoogleAuthProvider
} from "firebase/auth";
import {auth} from "@/firebase/client";
import {signIn, signUp} from "@/lib/actions/auth.action";
import VerificationScreen from "./auth/VerificationScreen";
import AuthCard from "./auth/AuthCard";
import AuthHeader from "./auth/AuthHeader";

const authFormSchema = (type: FormType) => {
    return z.object({
        name: type === 'sign-up' ? z.string().min(3) : z.string().optional(),
        email: z.string().email(),
        password: z.string().min(3),
    })
}

const AuthForm = ({ type }: { type: FormType }) => {
    const router = useRouter();
    const formSchema = authFormSchema(type);
    const [verificationSent, setVerificationSent] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [isResending, setIsResending] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            if(type === 'sign-up') {
                const { name, email, password } = values;

                const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
                
                // Send verification email
                await sendEmailVerification(userCredentials.user);
                
                const result = await signUp({
                    uid: userCredentials.user.uid,
                    name: name!,
                    email,
                    password,
                })

                if(!result?.success) {
                    toast.error(result?.message);
                    return;
                }

                // Show verification screen
                setUserEmail(email);
                setVerificationSent(true);
                toast.success('Account created. Please verify your email.');
            } else {
                const { email, password } = values;

                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                
                // Check if email is verified
                if (!userCredential.user.emailVerified) {
                    setUserEmail(email);
                    setVerificationSent(true);
                    toast.error('Please verify your email before signing in.');
                    return;
                }

                const idToken = await userCredential.user.getIdToken();

                if(!idToken) {
                    toast.error('Sign in failed')
                    return;
                }

                await signIn({
                    email, idToken
                })

                toast.success('Sign in successfully.');
                router.push('/')
            }
        } catch (error) {
            console.log(error);
            toast.error(`There was an error: ${error}`)
        }
    }
    
    const handleResendVerification = async () => {
        try {
            setIsResending(true);
            // Re-authenticate to get the user object
            const userCredential = await signInWithEmailAndPassword(
                auth, 
                userEmail, 
                form.getValues().password
            );
            
            await sendEmailVerification(userCredential.user);
            toast.success('Verification email resent. Please check your inbox.');
        } catch (error) {
            console.error('Error resending verification:', error);
            toast.error('Failed to resend verification email. Please try again.');
        } finally {
            setIsResending(false);
        }
    };
    
    const handleCheckVerification = async () => {
        try {
            setIsChecking(true);
            // Re-authenticate to get the user object
            const userCredential = await signInWithEmailAndPassword(
                auth, 
                userEmail, 
                form.getValues().password
            );
            
            // Reload the user to get the latest emailVerified status
            await reload(userCredential.user);
            
            if (userCredential.user.emailVerified) {
                // User is verified, proceed with sign in
                const idToken = await userCredential.user.getIdToken();
                await signIn({ email: userEmail, idToken });
                toast.success('Email verified successfully. Signing in...');
                router.push('/');
            } else {
                toast.error('Your email is not verified yet. Please check your inbox.');
            }
        } catch (error) {
            console.error('Error checking verification:', error);
            toast.error('Failed to check verification status. Please try again.');
        } finally {
            setIsChecking(false);
        }
    };

    const handleBackToSignIn = () => {
        setVerificationSent(false);
        router.push('/sign-in');
    };

    const handleGoogleSignIn = async () => {
        try {
            setIsGoogleLoading(true);
            const provider = new GoogleAuthProvider();
            
            // Add these settings to help with the sign-in experience
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            
            try {
                const userCredential = await signInWithPopup(auth, provider);
                
                // Get user info
                const user = userCredential.user;
                
                // Get the ID token
                const idToken = await user.getIdToken();

                
                // Always try to create/update the user record in your database
                const signUpResult = await signUp({
                    uid: user.uid,
                    name: user.displayName || 'User',
                    email: user.email || '',
                    password: '' // Empty password indicates Google sign-in
                });
                
                if (!signUpResult?.success) {
                    toast.error(signUpResult?.message || 'Failed to create account');
                    setIsGoogleLoading(false);
                    return;
                }
                
                // Sign in the user with your backend
                const signInResult = await signIn({
                    email: user.email || '',
                    idToken
                });
                
                if (!signInResult?.success) {
                    toast.error(signInResult?.message || 'Failed to sign in');
                    setIsGoogleLoading(false);
                    return;
                }
                
                toast.success('Signed in successfully with Google');
                
                // Use router.replace instead of push to avoid navigation issues
                router.replace('/');
            } catch (popupError: unknown) {
                console.error("Popup error:", popupError);
                
                if ((popupError as { code?: string }).code === 'auth/popup-closed-by-user' ||
                    (popupError as { code?: string }).code === 'auth/popup-blocked' ||
                    (popupError as Error).message?.includes('Cross-Origin-Opener-Policy')) {
                    
                    toast.error('Popup authentication failed. Please try again.');
                    throw popupError; // Re-throw to be caught by the outer catch
                }
            }
        } catch (error: unknown) {
            console.error('Google sign-in error:', error);
            
            // Handle specific error cases
            if ((error as { code?: string }).code === 'auth/popup-closed-by-user') {
                toast.error('Sign-in cancelled. Please try again.');
            } else if ((error as { code?: string }).code === 'auth/popup-blocked') {
                toast.error('Pop-up blocked by browser. Please allow pop-ups for this site.');
            } else {
                toast.error(`Google sign-in failed: ${(error as Error)?.message || 'Unknown error'}`);
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };
    
    const isSignIn = type === 'sign-in';
    
    // Show verification screen if email verification has been sent
    if (verificationSent) {
        return (
            <VerificationScreen
                userEmail={userEmail}
                isResending={isResending}
                isChecking={isChecking}
                onResendVerification={handleResendVerification}
                onCheckVerification={handleCheckVerification}
                onBackToSignIn={handleBackToSignIn}
            />
        );
    }

    // Regular auth form
    return (
        <AuthCard>
            <AuthHeader title="AI-powered real-time interview platform for smarter hiring" />

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-6 mt-4 form"
              >
                {!isSignIn && (
                  <FormField
                    control={form.control}
                    name="name"
                    label="Name"
                    placeholder="Your Name"
                    type="text"
                  />
                )}

                <FormField
                  control={form.control}
                  name="email"
                  label="Email"
                  placeholder="Your email address"
                  type="email"
                />

                <FormField
                  control={form.control}
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                />

                <Button className="btn" type="submit">
                  {isSignIn ? "Sign In" : "Create an Account"}
                </Button>
              </form>
            </Form>
            
            {/* Divider */}
            <div className="relative flex items-center justify-center mt-6 mb-4">
              <div className="absolute border-t border-gray-700 w-full"></div>
              <span className="relative px-4 bg-gray-700 text-light-300 text-sm rounded-lg">or</span>
            </div>
            
            {/* Google Sign In Button */}
            <Button 
              type="button"
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-2 border-gray-700 hover:bg-dark-300 transition-colors cursor cursor-pointer"
            >
              {isGoogleLoading ? (
                <span className="animate-spin h-4 w-4 border-2 border-primary-200 rounded-full border-t-transparent"></span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
              )}
              <span>{isSignIn ? "Sign in with Google" : "Sign up with Google"}</span>
            </Button>

            <p className="text-center flex flex-col sm:flex-row gap-3 justify-center mt-6">
              {isSignIn ? "No account yet?" : "Have an account already?"}
              <Link
                href={!isSignIn ? "/sign-in" : "/sign-up"}
                className="font-bold text-user-primary ml-1"
              >
                {!isSignIn ? "Sign In" : "Sign Up"}
              </Link>
            </p>
        </AuthCard>
    );
};

export default AuthForm;