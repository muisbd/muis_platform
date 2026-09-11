import EventDetailPage from '../../../src/components/EventDetailPage.js';

export default async function Page({ params }) {
  const { eventId } = await params;
  return <EventDetailPage eventId={eventId} />;
}
