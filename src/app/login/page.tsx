import LoginForm from "@/components/LoginForm";
import { isAuthConfigured } from "@/lib/auth";

export const metadata = {
  title: "Sign in · Pokédex",
};

interface PageProps {
  searchParams?: { callbackUrl?: string | string[] };
}

function pickCallback(value?: string | string[]): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

export default function LoginPage({ searchParams }: PageProps) {
  const callbackUrl = pickCallback(searchParams?.callbackUrl);
  return (
    <LoginForm authConfigured={isAuthConfigured} callbackUrl={callbackUrl} />
  );
}
