"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/context/supabase-context";

export function CTASection() {
  const router = useRouter();
  const { user } = useSupabase();

  return (
    <section className="py-24 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Ready to create your first startup with ease?
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join our platform today and start your journey to success.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
            {user ? (
              <Button
                size="lg"
                onClick={() => router.push('/dashboard')}
                className="w-full min-[400px]:w-auto"
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={() => router.push('/signup')}
                  className="w-full min-[400px]:w-auto"
                >
                  Get Started Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => router.push('/signin')}
                  className="w-full min-[400px]:w-auto"
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
