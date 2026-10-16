import { FollowAlong } from "@/components/FollowAlong";

export default async function Tutor({
  searchParams,
}: {
  searchParams: Promise<{ problem?: string | string[] }>;
}) {
  const params = await searchParams;
  const problem = typeof params.problem === "string" ? params.problem : "";
  return (
    <main>
      <FollowAlong initial={problem} />
    </main>
  );
}
