import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import dqReducer from "./slices/dqSlice";
import interviewReducer from "./slices/interviewSlice";
import streakMiddleware from "./middleware/streakMiddleware";

const store = configureStore({
  reducer: {
    auth: authReducer,
    dq: dqReducer,
    interview: interviewReducer,
    // Add other reducers here as your application grows
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(streakMiddleware),
  devTools: import.meta.env.DEV,
});

export default store;
