import Image from "next/image";

import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";
import AnimatedCTAButton from "@/components/AnimatedCTAButton";
import AnimatedText from "@/components/AnimatedText";
import Footer from "@/components/Footer";

async function Home() {
  const user = await getCurrentUser();

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user?.id || ''),
    getLatestInterviews({ userId: user?.id || '' }),
  ]);

  const hasPastInterviews = (userInterviews?.length ?? 0) > 0;
  const hasUpcomingInterviews = (allInterview?.length ?? 0) > 0;

  return (
    <>
      <section className="card-cta flex-col-reverse md:flex-row items-center">
        <div className="flex flex-col gap-6 max-w-md mt-6 sm:mt-0">
          <AnimatedText delay={0.1}>
            <h2><span className="text-orange-300">AI-Powered</span> Real-Time Interview Platform for Smarter Hiring</h2>
          </AnimatedText>
          
          <AnimatedText delay={0.2}>
            <p className="text-lg">
              Practice real interview questions & get instant feedback.<br />
              For example: Frontend, Backend, Fullstack, Design, UX/UI.
            </p>
          </AnimatedText>

          <AnimatedCTAButton href="/interview" delay={0.3}>
            Create an Interview
          </AnimatedCTAButton>
        </div>

        <Image
          src="/robot.png"
          alt="Robot Pytai"
          width={400}
          height={254}
          className="w-[250px] sm:w-[400px] mx-auto mb-0 sm:mx-0 sm:mb-4 md:mb-0"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Interviews created by { }
          <span className="text-primary-200">{user?.name}</span>
        </h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                coverImage={interview.coverImage}
                level={interview.level}
                questions={interview.questions}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>All Interviews</h2>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                coverImage={interview.coverImage}
                level={interview.level}
                questions={interview.questions}
              />
            ))
          ) : (
            <p>There are no interviews available</p>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;