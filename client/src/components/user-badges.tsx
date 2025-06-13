import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import type { UserBadges as UserBadgesType } from "@shared/schema";

interface UserBadgesProps {
  sessionId: string;
}

export function UserBadges({ sessionId }: UserBadgesProps) {
  const { data: userBadges, isLoading } = useQuery<UserBadgesType>({
    queryKey: ['/api/badges', sessionId],
    enabled: !!sessionId,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-32 mb-2"></div>
        <div className="flex gap-2">
          <div className="h-6 bg-slate-200 rounded w-16"></div>
          <div className="h-6 bg-slate-200 rounded w-16"></div>
        </div>
      </div>
    );
  }

  if (!userBadges || !userBadges.badges || userBadges.badges.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-slate-600 text-sm">Vote on concerts to earn badges!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-800">Your Badges</h3>
      <div className="flex flex-wrap gap-2">
        {userBadges.badges.map((badge) => (
          <Badge
            key={badge.id}
            className={`${badge.color} text-xs flex items-center gap-1 px-2 py-1`}
            title={badge.description}
          >
            <span className="text-sm">{badge.icon}</span>
            <span>{badge.name}</span>
          </Badge>
        ))}
      </div>
      {userBadges.session.totalVotes > 0 && (
        <div className="text-xs text-slate-600">
          Total votes: {userBadges.session.totalVotes} | 
          Concerts voted: {userBadges.session.uniqueConcertsVoted}
        </div>
      )}
    </div>
  );
}