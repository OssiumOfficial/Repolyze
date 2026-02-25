import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginClient } from "./login-client";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return <LoginClient />;
}
