import { FeedClient } from "@/components/sessions/FeedClient";
import { listPublicFeedItems } from "@/services/feed";
import { listSpots } from "@/services/spots";

export default async function FeedPage() {
  const [items, spots] = await Promise.all([listPublicFeedItems(), listSpots()]);

  return <FeedClient items={items} spots={spots} />;
}
