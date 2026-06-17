import { ReviewPageShell } from "@/components/review/ReviewPage";

export const dynamic = "force-dynamic";

export default function ReviewRoute({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; start?: string; end?: string }>;
}) {
  return <ReviewPageShell searchParams={searchParams} />;
}
