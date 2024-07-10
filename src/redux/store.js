import { createSlice, configureStore } from '@reduxjs/toolkit';

const authSlice = createSlice({
    name: 'auth', // Add the 'name' option here
    initialState: {
        isLogin: false
    },
    reducers: {
        login(state) {
            state.isLogin = true;
        },
        logout(state) {
            state.isLogin = false;
        }
    }
});

export const authActions = authSlice.actions;

export const store = configureStore({
    reducer: authSlice.reducer, // Use 'reducer' instead of 'reducers'
});
