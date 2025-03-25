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
  reload
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

            <p className="text-center flex flex-col sm:flex-row gap-3 justify-center">
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