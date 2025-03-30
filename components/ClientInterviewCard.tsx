"use client";

interface ClientInterviewCardProps {
  interview: Interview;
  userId?: string;
  interviewCard: React.ReactNode;
}

export default function ClientInterviewCard({ 
  interviewCard 
}: ClientInterviewCardProps) {
  return (
    <>
      {interviewCard}
    </>
  );
}