import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./authStore";

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
  });

  it("starts logged out", () => {
    const { user, token } = useAuthStore.getState();
    expect(user).toBeNull();
    expect(token).toBeNull();
  });

  it("login sets user and token", () => {
    const user = { id: 1, name: "Zelalem", email: "z@example.com" };
    useAuthStore.getState().login(user, "fake-token");

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.token).toBe("fake-token");
  });

  it("logout clears user and token", () => {
    useAuthStore.getState().login(
      { id: 1, name: "Zelalem", email: "z@example.com" },
      "fake-token"
    );
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });
});