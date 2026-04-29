import LoginForm from "@/components/LoginForm";
import { isAuthConfigured } from "@/lib/auth";

export const metadata = {
  title: "Sign in · Pokédex",
};

export default function LoginPage() {
  return <LoginForm authConfigured={isAuthConfigured} />;
}
