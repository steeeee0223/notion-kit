"use client";

import { useState } from "react";

import { AuthProvider, LoginForm, type LoginMode } from "@notion-kit/auth-ui";

const BASE_URL = ""; // Set your base URL here if needed

export default function Demo() {
  const [mode, setMode] = useState<LoginMode>("sign_in");

  return (
    <AuthProvider baseURL={BASE_URL}>
      <LoginForm callbackURL="/" mode={mode} onModeChange={setMode} />
    </AuthProvider>
  );
}
