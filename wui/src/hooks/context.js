import { createContext, useContext as reactUseContext } from "react";

export const Context = createContext({});
export const useContext = () => reactUseContext(Context);
