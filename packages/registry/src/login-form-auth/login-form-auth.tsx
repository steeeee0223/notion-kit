import { AuthProvider, LoginForm } from "@notion-kit/auth-ui";

export default function Demo() {
  return (
    <AuthProvider>
      <div className="flex h-full w-full flex-col items-center justify-center gap-10 bg-main">
        <h1 className="text-lg font-bold text-primary">Login Page</h1>
        <LoginForm mode="sign_in" className="w-80" />
      </div>
    </AuthProvider>
  );
}
