import { auth, currentUser } from "@clerk/nextjs/server";
import { ensureUser } from "@/lib/repositories/workspaceRepository";

export async function requireApiUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await currentUser();
  await ensureUser({
    clerkUserId: userId,
    email: user?.primaryEmailAddress?.emailAddress,
    name: user?.fullName ?? undefined,
  });

  return { userId };
}

export function parseJsonBody<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
}
