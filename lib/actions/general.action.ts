"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    // Check if there's meaningful user participation
    const userMessages = transcript.filter(msg => msg.role === "user");
    const hasMinimalParticipation = userMessages.length <= 1;
    
    // If user barely participated, assign a very low score
    if (hasMinimalParticipation) {
      const feedback = {
        interviewId: interviewId,
        userId: userId,
        totalScore: 1, // Very low score for non-participation
        categoryScores: [
          { name: "Communication Skills", score: 1, comment: "The candidate provided minimal or no responses during the interview." },
          { name: "Technical Knowledge", score: 1, comment: "Unable to assess technical knowledge due to lack of participation." },
          { name: "Problem Solving", score: 1, comment: "Unable to assess problem-solving skills due to lack of participation." },
          { name: "Cultural Fit", score: 1, comment: "Minimal interaction makes it difficult to assess cultural fit." },
          { name: "Confidence and Clarity", score: 1, comment: "The candidate did not engage sufficiently to demonstrate confidence or clarity." }
        ],
        strengths: ["No strengths identified due to limited participation."],
        areasForImprovement: [
          "Active participation in the interview process",
          "Providing detailed responses to questions",
          "Completing the full interview to allow proper assessment"
        ],
        finalAssessment: "The interview was ended prematurely with minimal or no participation from the candidate. A proper assessment could not be made due to insufficient interaction. We recommend retaking the interview with full engagement to receive meaningful feedback.",
        createdAt: new Date().toISOString(),
      };

      let feedbackRef;
      if (feedbackId) {
        feedbackRef = db.collection("feedback").doc(feedbackId);
      } else {
        feedbackRef = db.collection("feedback").doc();
      }
      await feedbackRef.set(feedback);
      return { success: true, feedbackId: feedbackRef.id };
    }

    // Normal AI-based assessment for users who participated
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis.

        Important scoring guidelines:
        - Score from 0 to 100 in each category
        - Reserve scores of 90-100 for truly exceptional answers that demonstrate mastery
        - A score of 100 should be possible for candidates who provide comprehensive, accurate, and insightful responses
        - Scores of 0-20 indicate minimal or incorrect responses
        - Scores of 40-60 indicate average performance
        - Scores of 70-80 indicate good but not exceptional performance
        
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses, appropriate technical vocabulary.
        - **Technical Knowledge**: Deep understanding of key concepts, accurate explanations, awareness of best practices.
        - **Problem-Solving**: Ability to analyze problems, propose effective solutions, consider edge cases and alternatives.
        - **Cultural & Role Fit**: Alignment with company values, teamwork indicators, understanding of the role.
        - **Confidence & Clarity**: Confidence in responses, engagement, clarity of thought, minimal hesitation.
        
        For candidates who demonstrate exceptional mastery in all areas, do not hesitate to award scores in the 90-100 range.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be fair and objective, rewarding excellence when demonstrated.",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}