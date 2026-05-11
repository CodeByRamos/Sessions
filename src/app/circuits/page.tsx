import { CircuitsClient } from "@/components/circuits/CircuitsClient";
import { listCompetitions } from "@/services/circuits";
import { listSpots } from "@/services/spots";
import { getCurrentUser } from "@/services/users";

export default async function CircuitsPage() {
  const [competitions, spots, user] = await Promise.all([
    listCompetitions(),
    listSpots(),
    getCurrentUser(),
  ]);

  return <CircuitsClient competitions={competitions} spots={spots} currentUser={user} />;
}
