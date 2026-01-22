import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <span className="text-primary">ALVIN</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Active Language and Vitality Intelligence Network
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Card className="max-w-xs">
              <CardHeader>
                <CardTitle>How It Works →</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Daily check-ins with 4-level escalating alerts ensure your
                family knows you&apos;re okay.
              </CardContent>
            </Card>
            <Card className="max-w-xs">
              <CardHeader>
                <CardTitle>Peace of Mind →</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Never false alarm — contacts are only reached when truly needed,
                after multiple missed check-ins.
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-foreground">
              {hello ? hello.greeting : "Loading tRPC query..."}
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-foreground">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {session && (
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                )}
                {session && (
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/check-in">Check In</Link>
                  </Button>
                )}
                {session && (
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/profile">Settings</Link>
                  </Button>
                )}
                {session && (
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/contacts">Contacts</Link>
                  </Button>
                )}
                {session && (
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/alerts">Alerts</Link>
                  </Button>
                )}
                <Button asChild variant="default" size="lg">
                  <Link href={session ? "/api/auth/signout" : "/api/auth/signin"}>
                    {session ? "Sign out" : "Sign in"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {session?.user && <LatestPost />}
        </div>
      </main>
    </HydrateClient>
  );
}
