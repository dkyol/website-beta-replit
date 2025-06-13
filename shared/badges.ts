import type { Badge, UserSession } from "./schema";

// Define all available badges with their requirements
export const AVAILABLE_BADGES: Badge[] = [
  {
    id: "first_vote",
    name: "First Fan",
    description: "Cast your first vote",
    icon: "🎵",
    color: "bg-blue-100 text-blue-800",
    requirement: (session: UserSession) => session.totalVotes >= 1,
  },
  {
    id: "enthusiast",
    name: "Music Enthusiast", 
    description: "Vote on 5 different concerts",
    icon: "🎼",
    color: "bg-green-100 text-green-800",
    requirement: (session: UserSession) => session.uniqueConcertsVoted >= 5,
  },
  {
    id: "super_fan",
    name: "Super Fan",
    description: "Cast 10 total votes",
    icon: "⭐",
    color: "bg-yellow-100 text-yellow-800",
    requirement: (session: UserSession) => session.totalVotes >= 10,
  },
  {
    id: "excitement_guru",
    name: "Excitement Guru",
    description: "Cast 5 'Very Excited' votes",
    icon: "🔥",
    color: "bg-red-100 text-red-800",
    requirement: (session: UserSession) => session.excitedVotes >= 5,
  },
  {
    id: "curator",
    name: "Music Curator",
    description: "Show interest in 8 different performances",
    icon: "🎭",
    color: "bg-purple-100 text-purple-800",
    requirement: (session: UserSession) => session.interestedVotes >= 8,
  },
  {
    id: "dedication_champion",
    name: "Dedication Champion",
    description: "Cast 25 total votes",
    icon: "🏆",
    color: "bg-amber-100 text-amber-800",
    requirement: (session: UserSession) => session.totalVotes >= 25,
  },
];

export function calculateUserBadges(session: UserSession): Badge[] {
  return AVAILABLE_BADGES.filter(badge => badge.requirement(session));
}