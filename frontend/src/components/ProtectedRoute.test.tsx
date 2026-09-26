import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { useAuthStore } from "../store/authStore";

function renderWithRouter(token: string | null) {
  useAuthStore.setState({
    user: token ? { id: 1, name: "Z", email: "z@test.com" } : null,
    token,
  });

  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
  });

  it("redirects to login when unauthenticated", () => {
    renderWithRouter(null);
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    renderWithRouter("valid-token");
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});