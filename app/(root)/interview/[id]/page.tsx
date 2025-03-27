import Image from "next/image";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

import Agent from "@/components/Agent";
import { getRandomInterviewCover } from "@/lib/utils";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";

const InterviewDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id || '',
  });

  // Use the interview's coverImage if available, otherwise get a random one
  const imageSrc = interview.coverImage || getRandomInterviewCover();
  
  // Normalize the interview type for consistent badge styling
  const normalizedType = /mix/gi.test(interview.type) ? "Mixed" : interview.type;
  
  // Ensure the type always starts with a capital letter
  const displayType = normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1).toLowerCase();
  
  // Type badge color mapping - same as in InterviewCard
  const typeBadgeColor =
    {
      Behavioral: "bg-violet-600",
      Mixed: "bg-yellow-600",
      Technical: "bg-blue-600",
    }[displayType] || "bg-violet-600";
  
  // Level badge color mapping - same as in InterviewCard
  const levelBadgeColor = {
    "entry level": "bg-emerald-600",
    beginner: "bg-teal-600",
    junior: "bg-lime-600",
    intermediate: "bg-amber-500",
    senior: "bg-orange-500",
    advanced: "bg-sky-600",
    expert: "bg-indigo-600",
  }[interview.level?.toLowerCase() || "beginner"] || "bg-green-600";

  // Capitalize the first letter of the level for display
  const displayLevel = interview.level 
    ? interview.level.charAt(0).toUpperCase() + interview.level.slice(1).toLowerCase()
    : "Beginner";

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Image
            src={imageSrc}
            alt="cover-image"
            width={50}
            height={50}
            className="rounded-full object-cover size-[50px]"
          />
          <h3 className="capitalize text-xl font-medium">{interview.role} Interview</h3>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-dark-300 px-3 py-2 rounded-full">
            <Image src="/question.svg" width={20} height={20} alt="questions" />
            <span className="text-white">{interview.questions?.length || 0} questions</span>
          </div>
          
          <div className="flex gap-2">
            {/* Level badge */}
            <p className={cn("px-4 py-2 rounded-lg", levelBadgeColor)}>
              <span className="badge-text font-medium text-white">{displayLevel}</span>
            </p>
            
            {/* Type badge */}
            <p className={cn("px-4 py-2 rounded-lg", typeBadgeColor)}>
              <span className="badge-text font-medium text-white">{displayType}</span>
            </p>
          </div>
        </div>
      </div>

      <Agent
        userName={user?.name || ''}
        userId={user?.id}
        userAvatar={user?.photoURL}
        interviewId={id}
        type="interview"
        questions={interview.questions}
        feedbackId={feedback?.id}
      />
    </>
  );
};

export default InterviewDetails;