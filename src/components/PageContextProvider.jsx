import { createContext } from 'react';

export const PageContext = createContext()
function PageContextProvider({ value, children }) {
    
    return (
        <PageContext.Provider value={value}>
            {children}
        </PageContext.Provider>
    );
}
export default PageContextProvider;
