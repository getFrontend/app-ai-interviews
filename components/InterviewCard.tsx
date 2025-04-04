import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";
import { MetalButton } from "./MetalButton";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
  coverImage,
  level,
  questions,
}: InterviewCardProps) => {
  const feedback =
    userId && interviewId
      ? await getFeedbackByInterviewId({
          interviewId,
          userId,
        })
      : null;

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  // Type badge color mapping
  const typeBadgeColor =
    {
      Behavioral: "bg-light-800",
      Mixed: "bg-yellow-600",
      Technical: "bg-blue-600",
    }[normalizedType] || "bg-violet-600";

  // Level badge color mapping
  const levelBadgeColor = {
    "entry level": "bg-emerald-600",
    beginner: "bg-teal-600",
    junior: "bg-lime-600",
    intermediate: "bg-amber-500",
    senior: "bg-orange-500",
    advanced: "bg-sky-600",
    expert: "bg-indigo-600",
  }[level?.toLowerCase() || "beginner"] || "bg-green-600";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  // Use coverImage from props if available, otherwise use random cover
  const imageSrc = coverImage || getRandomInterviewCover();

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          {/* Type Badge - Top Right */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg z-10",
              typeBadgeColor
            )}
          >
            <p className="badge-text font-medium text-white">{normalizedType}</p>
          </div>

          {/* Level Badge - Top Left */}
          <div
            className={cn(
              "absolute top-0 left-0 w-fit px-4 py-2 rounded-br-lg z-10",
              levelBadgeColor
            )}
          >
            <p className="badge-text font-medium text-white capitalize">{level || "Beginner"}</p>
          </div>

          {/* Cover Image */}
          <Image
            src={imageSrc}
            alt="cover-image"
            width={90}
            height={90}
            className="rounded-full object-fit size-[90px] mt-6 mx-auto"
          />

          {/* Interview Role */}
          <h3 className="my-5 capitalize">{role} Interview</h3>

          {/* Date & Score & Questions Count */}
          <div className="flex flex-row flex-wrap gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image
                src="/calendar.svg"
                width={22}
                height={22}
                alt="calendar icon"
              />
              <p>{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Image 
                src="/star-2.svg" 
                width={22} 
                height={22} 
                alt="star icon"
              />
              <p>{feedback?.totalScore || "---"}/100</p>
            </div>
            
            <div className="flex flex-row gap-2 items-center">
              <Image 
                src="/question.svg" 
                width={22} 
                height={22} 
                alt="question icon" 
              />
              <p>
                {questions?.length || 0}
              </p>
            </div>
          </div>

          {/* Feedback or Placeholder Text */}
          <p className="line-clamp-2 mt-5">
            {feedback?.finalAssessment ||
              "You haven't taken this interview yet. Take it now to improve your skills."}
          </p>
        </div>

        <div className="flex flex-row justify-between">
          <DisplayTechIcons techStack={techstack} />

            <Link
              href={
                feedback
                  ? `/interview/${interviewId}/feedback`
                  : `/interview/${interviewId}`
              }
            >
              {feedback ? <MetalButton variant="primary">Check Feedback</MetalButton> : <MetalButton variant="bronze">Start Interview</MetalButton>}
            </Link>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;