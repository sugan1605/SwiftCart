import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

//JEG KOMMER TIL Å BRUKE USEAPPDISPATCH OG USEAPPSELECTOR I ALLE CLIENT COMPONENTS SENERE
