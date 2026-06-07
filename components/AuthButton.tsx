"use client";

import { useUser, signInWithGoogle, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 16 3 9.1 7.6 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.9 26.7 37 24 37c-5.3 0-9.7-3.6-11.3-8.4l-6.5 5C9.1 40.4 16 45 24 45z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.5l6.3 5.3C39.9 35.7 45 30.5 45 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

export function AuthButton() {
  const { user, loading } = useUser();

  if (loading) {
    return <div className="h-9 w-28 rounded-md bg-secondary/40 animate-pulse" />;
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        className="gap-2 h-9 text-sm"
        onClick={() => signInWithGoogle()}
      >
        <GoogleGlyph />
        Entrar con Google
      </Button>
    );
  }

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "Cuenta";
  const avatar = user.user_metadata?.avatar_url as string | undefined;

  return (
    <div className="flex items-center gap-2.5">
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatar}
          alt={name}
          className="h-8 w-8 rounded-full border border-border"
        />
      ) : (
        <div className="h-8 w-8 rounded-full border border-border bg-secondary flex items-center justify-center text-xs font-bold">
          {name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <span className="text-sm text-muted-foreground hidden sm:block max-w-[10rem] truncate">
        {name}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        onClick={() => signOut()}
        title="Cerrar sesión"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
