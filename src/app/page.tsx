import { redirect } from "next/navigation";
import { ROLES } from "@/lib/roles";
import { getCurrentUser } from "@/server/services/auth-service";

export default async function RootPage() {
  const user = await getCurrentUser();
  redirect(user ? ROLES[user.role].homePath : "/login");
}
