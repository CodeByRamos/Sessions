import { AuthForm } from "@/components/auth/AuthForm";

export default function SignInPage() {
  return (
    <div className="page-shell grid min-h-[calc(100vh-88px)] place-items-center">
      <AuthForm mode="login" />
    </div>
  );
}
