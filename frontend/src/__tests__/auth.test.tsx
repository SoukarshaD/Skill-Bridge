import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoginPage from "../app/(auth)/login/page";
import RegisterPage from "../app/(auth)/register/page";
import { AuthProvider } from "../lib/auth-context";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock fetch for AuthProvider
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: false,
    json: () => Promise.resolve({ error: "Not logged in" }),
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) as any;

describe("Auth Pages Smoke Test", () => {
  it("renders the login page", () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("renders the register page", () => {
    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/i am a/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });
});
