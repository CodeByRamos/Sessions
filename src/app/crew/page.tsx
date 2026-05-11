import { CrewBoard } from "@/components/crew/CrewBoard";
import { listCrewSessions } from "@/services/crew";
import { listSpots } from "@/services/spots";
import { getCurrentUser } from "@/services/users";

export default async function CrewPage() {
  const [crewSessions, spots, user] = await Promise.all([
    listCrewSessions(),
    listSpots(),
    getCurrentUser(),
  ]);

  return (
    <CrewBoard
      crewSessions={crewSessions}
      spots={spots}
      currentUserId={user?.id}
    />
  );
}
