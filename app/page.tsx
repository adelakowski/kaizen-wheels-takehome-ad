import { SearchPage } from "@/components/search/SearchPage";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <SearchPage searchParams={await searchParams} />;
}
