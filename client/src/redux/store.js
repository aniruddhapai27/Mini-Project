import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import dqReducer from "./slices/dqSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    dq: dqReducer,
    // Add other reducers here as your application grows
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
});

export default store;
