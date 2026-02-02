import { configureStore } from '@reduxjs/toolkit'
import {authReducer} from "./slices/authSlice.ts";
import {ticketReducer} from "./slices/ticketSlice.ts";
import {incidentReducer} from "./slices/incidentSlice.ts";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ticket: ticketReducer,
        incident: incidentReducer,
    },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch