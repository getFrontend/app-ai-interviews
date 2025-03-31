"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import CallHint from "@/components/CallHint";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  userAvatar,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [showCallHint, setShowCallHint] = useState(true);
  const [lastActivityTimestamp, setLastActivityTimestamp] = useState<number>(Date.now());
  const INACTIVITY_TIMEOUT = process.env.NEXT_PUBLIC_VAPI_INACTIVITY_TIMEOUT 
                            ? parseInt(process.env.NEXT_PUBLIC_VAPI_INACTIVITY_TIMEOUT) 
                            : 10000; // time of inactivity will end the call
  // Add question tracking
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const totalQuestions = questions?.length || 0;

  const handleDisconnect = useCallback(() => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  }, []);
  
  // Inactivity monitor
  useEffect(() => {
    if (callStatus !== CallStatus.ACTIVE) return;
    
    const inactivityTimer = setInterval(() => {
      const now = Date.now();
      if (now - lastActivityTimestamp > INACTIVITY_TIMEOUT) {
        console.log("Inactivity timeout reached, ending call");
        handleDisconnect();
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(inactivityTimer);
  }, [callStatus, lastActivityTimestamp, handleDisconnect, INACTIVITY_TIMEOUT]);
  
  // VAPI event handlers
  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
      setLastActivityTimestamp(Date.now());
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        setLastActivityTimestamp(Date.now());
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
        
        // Track question progress - only increment counter when AI asks a MAIN question
        // We'll use a more sophisticated approach to identify main questions
        if (message.role === "assistant" && 
            totalQuestions > 0 && 
            currentQuestionIndex < totalQuestions) {
          
          // Check if this message contains a question that matches one of our prepared questions
          if (message.transcript.includes("?") && questions) {
            // Try to match this message with one of our prepared questions
            const isMainQuestion = questions.some(question => {
              // Create a simplified version of both texts for comparison (lowercase, no punctuation)
              const simplifiedTranscript = message.transcript.toLowerCase().replace(/[^\w\s]/g, '');
              const simplifiedQuestion = question.toLowerCase().replace(/[^\w\s]/g, '');
              
              // Check if the transcript contains a significant portion of the question
              // This helps match even if the AI rephrases slightly
              return simplifiedTranscript.includes(simplifiedQuestion.substring(0, Math.min(30, simplifiedQuestion.length)));
            });
            
            if (isMainQuestion) {
              setCurrentQuestionIndex(prev => prev + 1);
              console.log(`Question ${currentQuestionIndex + 1}/${totalQuestions} asked (matched with prepared question)`);
            }
          }
        }
        
        // Auto-end call when all questions have been asked AND answered
        // Only consider ending after the last question has been asked
        if (currentQuestionIndex >= totalQuestions && totalQuestions > 0) {
          // Only end the call after the user has responded to the last question
          if (message.role === "user") {
            console.log("All questions completed and user has responded, ending call automatically");
            // Add a longer delay to allow for final exchange and closing remarks
            setTimeout(() => {
              handleDisconnect();
            }, 15000); // 15 second grace period after user's final answer
          }
        }
      }
    };

    const onSpeechStart = () => {
      console.log("Speech start!");
      setLastActivityTimestamp(Date.now()); // Update timestamp when speech starts
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("Speech end!");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
      
      // More robust error handling for meeting ended errors
      if (
        (typeof error === 'object' && error !== null) && 
        (
          // Check various possible error message formats
          (error.message && error.message.includes("Meeting has ended")) ||
          (error.toString().includes("Meeting has ended")) ||
          (JSON.stringify(error).includes("Meeting has ended"))
        )
      ) {
        console.log("Detected meeting end, transitioning to FINISHED state");
        setCallStatus(CallStatus.FINISHED);
        vapi.stop(); // Ensure VAPI is properly stopped
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [currentQuestionIndex, totalQuestions, handleDisconnect, questions]); 

  // Handle messages and call status changes
  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {      
      toast.loading("Generating feedback from your interview...", {
        duration: 5000,
        id: "feedback-toast"
      });

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
      });

      if (success && id) {
        toast.success("Feedback generated successfully!", {
          id: "feedback-toast"
        });
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        toast.error("Failed to generate feedback", {
          id: "feedback-toast"
        });
        router.push("/");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        toast.success("Interview generated successfully!", {
          duration: 3000,
          id: "generate-toast"
        });
        router.push("/");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      toast.loading("Generating your interview questions...", {
        duration: 10000,
        id: "generate-toast"
      });
      
      await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
        variableValues: {
          username: userName,
          userid: userId,
        },
      });
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

    return (
        <>
        <div className="call-view">
            {/* AI Interviewer Card */}
            <div className="card-interviewer">
                <div className="avatar">
                    <Image src="/ai-avatar-512.png" alt="AI Avatar" width={110} height={110} className="object-cover" />
                    {isSpeaking && <span className="animate-speak" />}
                </div>
                <h3>AI Interviewer</h3>
            </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <Image
              src={userAvatar || "/user-avatar.jpg"}
              alt="profile-image"
              width={539}
              height={539}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center relative">
        {callStatus === CallStatus.INACTIVE && showCallHint && (
          <CallHint 
            targetId="call-button"
            timeoutDuration={10000}
            text={type === "generate" ? "Click CALL to generate the interview" : "Click CALL to start the interview"}
            onDismiss={() => setShowCallHint(false)}
          />
        )}
        
        {callStatus !== "ACTIVE" ? (
          <button 
            id="call-button" 
            className="relative btn-call" 
            onClick={() => handleCall()}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />

            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED"
                ? "Call"
                : ". . ."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect cursor-pointer" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
