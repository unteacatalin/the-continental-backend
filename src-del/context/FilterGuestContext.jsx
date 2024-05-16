import { createContext, useContext, useState } from 'react';

const FilterGuestContext = createContext();

function FilterGuestProvider({ children }) {
  const [filterGuest, setFilterGuest] = useState('');

  return (
    <FilterGuestContext.Provider value={{ filterGuest, setFilterGuest }}>
      {children}
    </FilterGuestContext.Provider>
  );
}

function useFilterGuest() {
  const context = useContext(FilterGuestContext);
  if (context === undefined)
    throw new Error(
      'FilterGuestContext was used outside of the FilterGuestProvider'
    );
  return context;
}

export { FilterGuestProvider, useFilterGuest };
