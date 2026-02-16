import { configureStore } from '@reduxjs/toolkit'
import {authReducer} from "./slices/authSlice.ts";
import {ticketReducer} from "./slices/ticketSlice.ts";
import {incidentReducer} from "./slices/incidentSlice.ts"; // <-- Добавили импорт

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ticket: ticketReducer,
        incident: incidentReducer, // <-- Добавили в редьюсеры
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch