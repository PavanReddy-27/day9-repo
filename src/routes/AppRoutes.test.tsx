// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it } from "vitest";

import AppRoutes from "./AppRoutes";
import authReducer from "../redux/authSlice";

describe("AppRoutes", () => {
  it("renders the login page at /login and redirects the root path to it when unauthenticated", () => {
    const store = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          rememberMe: false,
          isAuthenticated: false,
          isLoading: false,
          initialized: false,
          error: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          rememberMe: false,
          initialized: false,
        },
      },
    });

    const { rerender } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/"]}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    expect(
      screen.getByText(/Sign in to continue to Workforce Analytics Dashboard/i)
    ).toBeInTheDocument();

    rerender(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/login"]}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>
    );

    expect(
      screen.getByText(/Sign in to continue to Workforce Analytics Dashboard/i)
    ).toBeInTheDocument();
  });
});
