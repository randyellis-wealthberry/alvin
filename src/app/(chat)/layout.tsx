import { redirect } from "next/navigation";
import { auth } from "~/server/auth";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="h-dvh w-full bg-gradient-to-b from-[#1a0533] via-[#2e026d] to-[#15162c]">
      {children}
    </div>
  );
}
