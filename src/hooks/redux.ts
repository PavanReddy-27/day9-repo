// src/hooks/redux.ts

import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";

import type {
  RootState,
  AppDispatch,
} from "../redux/store";

/* ==========================================================
   Typed Redux Hooks
========================================================== */

/**
 * Typed dispatch hook.
 *
 * Usage:
 * const dispatch = useAppDispatch();
 */
export const useAppDispatch =
  () => useDispatch<AppDispatch>();

/**
 * Typed selector hook.
 *
 * Usage:
 * const auth = useAppSelector(state => state.auth);
 */
export const useAppSelector:
  TypedUseSelectorHook<RootState> =
  useSelector;