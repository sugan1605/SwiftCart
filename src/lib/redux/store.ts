import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "@/features/cart/cartSlice"

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    // cart: cartReducer -> kommer senere nÅr vi lager cart slice
  },
});



//Types til hooks og TS
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;