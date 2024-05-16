import { createContext, useContext, useState } from 'react';

const CreateUpdateBookingContext = createContext();

function CreateUpdateBookingProvider({ children }) {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [bookingId, setBookingId] = useState();

  function updateStartDate(newDate) {
    setStartDate(newDate);
  }

  function updateEndDate(newDate) {
    setEndDate(newDate);
  }

  function updateBookingId(newBookingId) {
    setBookingId(newBookingId);
  }

  return (
    <CreateUpdateBookingContext.Provider
      value={{
        startDate,
        updateStartDate,
        endDate,
        updateEndDate,
        bookingId,
        updateBookingId,
      }}
    >
      {children}
    </CreateUpdateBookingContext.Provider>
  );
}

function useCreateUpdateBooking() {
  const context = useContext(CreateUpdateBookingContext);
  if (context === undefined)
    throw new Error(
      'CreateUpdateBookingContext was used outside of the CreateUpdateBookingProvider'
    );
  return context;
}

export { CreateUpdateBookingProvider, useCreateUpdateBooking };
