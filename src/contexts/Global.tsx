import React, { createContext, useReducer, useContext, Dispatch } from 'react';

// Define an enum for action names
export enum GlobalActionTypes {
    SET_MODAL_LIST = 'SET_MODAL_LIST',
    LIGHT_MODE = 'LIGHT_MODE',
    SIDEBAR_OPTION = 'SIDEBAR_OPTION',
}

// Define a type for the payload of each action
type ActionPayloads = {
    [GlobalActionTypes.SET_MODAL_LIST]: string[];
    [GlobalActionTypes.LIGHT_MODE]: boolean;
    [GlobalActionTypes.SIDEBAR_OPTION]: string;
};

type Action<T extends GlobalActionTypes> = {
    type: T;
    payload: ActionPayloads[T];
};

// Define the state type
export type State = {
    ModalList: string[],
    LightMode: boolean,
    SidebarOption: string,
};

// Define the initial state
const initialState: State = {
    ModalList: [],
    LightMode: true,
    SidebarOption: 'dashboard',
};

// Define the reducer function
const reducer = (state: State, action: Action<GlobalActionTypes>): State => {
    switch (action.type) {
        case GlobalActionTypes.SET_MODAL_LIST:
            return {
            ...state,
            ModalList: action.payload as string[],
            };
        
        case GlobalActionTypes.LIGHT_MODE:
            return {
            ...state,
            LightMode: action.payload as boolean,
            };

        case GlobalActionTypes.SIDEBAR_OPTION:
            return {
            ...state,
            SidebarOption: action.payload as string,
            };

        default:
            return state;
    }
};

// Create the context
const Context = createContext<{ globalState: State; globalDispatch: Dispatch<Action<GlobalActionTypes>> }>({
    globalState: initialState,
    globalDispatch: () => null,
});

// Define a hook to use the context
export const useGlobalContext = (): { globalState: State; globalDispatch: Dispatch<Action<GlobalActionTypes>> } => useContext(Context);

// Define the provider component
export const GlobalContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <Context.Provider value={{ globalState: state, globalDispatch: dispatch }}>
            {children}
        </Context.Provider>
    );
};
