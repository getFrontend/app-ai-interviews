import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";
const techIconLatestBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const results = await Promise.all(
    techArray.map(async (tech) => {
      const normalized = normalizeTechName(tech);
      
      // Define different icon variants to try
      const iconVariants = [
        `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
        `${techIconBaseURL}/${normalized}/${normalized}-plain.svg`,
        `${techIconBaseURL}/${normalized}/${normalized}-original-wordmark.svg`,
        `${techIconLatestBaseURL}/${normalized}/${normalized}-original.svg`,
        `${techIconLatestBaseURL}/${normalized}/${normalized}-plain.svg`,
        `${techIconLatestBaseURL}/${normalized}/${normalized}-original-wordmark.svg`
      ];
      
      // Try each variant until we find one that exists
      for (const url of iconVariants) {
        if (await checkIconExists(url)) {
          return { tech, url };
        }
      }
      
      // If no variant exists, return the fallback
      return { tech, url: "/tech.svg" };
    })
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};
