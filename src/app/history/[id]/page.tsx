import { ReportDetailClient } from './report-detail-client';

// Required for static export with dynamic routes.
// This tells Next.js not to pre-render any specific report pages at build time,
// as they are all generated dynamically on the client.
export async function generateStaticParams() {
  return [];
}

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  return <ReportDetailClient id={params.id} />;
}
