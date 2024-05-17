import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Rooms from './pages/Rooms';
import Users from './pages/Users';
import Settings from './pages/Settings';
import Account from './pages/Account';
import Login from './pages/Login';
import PageNotFound from './pages/PageNotFound';
import GlobalStyles from './styles/GlobalStyles';
import AppLayout from './ui/AppLayout';
import { Toaster } from 'react-hot-toast';
import Booking from './pages/Booking';
import Checkin from './pages/Checkin';
import ProtectedRoute from './ui/ProtectedRoute';
import { DarkModeProvider } from './context/DarkModeContext';
import { FilterGuestProvider } from './context/FilterGuestContext';
import { CreateUpdateBookingProvider } from './context/CreateUpdateBookingContext';

import Guests from './pages/Guests';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

function App() {
  // const { isDarkMode } = useDarkMode();

  return (
    <DarkModeProvider>
      <CreateUpdateBookingProvider>
        <FilterGuestProvider>
          <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools />
            <GlobalStyles />
            <BrowserRouter>
              <Routes>
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate replace to='dashboard' />} />
                  <Route path='dashboard' element={<Dashboard />} />
                  <Route path='bookings' element={<Bookings />} />
                  <Route path='bookings/:bookingId' element={<Booking />} />
                  <Route path='checkin/:bookingId' element={<Checkin />} />
                  <Route path='rooms' element={<Rooms />} />
                  <Route path='guests' element={<Guests />} />
                  <Route path='users' element={<Users />} />
                  <Route path='settings' element={<Settings />} />
                  <Route path='account' element={<Account />} />
                </Route>
                <Route path='login' element={<Login />} />
                <Route path='*' element={<PageNotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster
              position='top-center'
              gutter={12}
              containerStyle={{ margin: '8px' }}
              toastOptions={{
                success: {
                  duration: 3000,
                },
                error: {
                  duration: 5000,
                },
                style: {
                  fontSize: '16px',
                  maxWidth: '500px',
                  padding: '16px 24px',
                  backgroundColor: 'var(--color-grey-0)',
                  color: 'var(--color-grey-700)',
                },
              }}
            />
          </QueryClientProvider>
        </FilterGuestProvider>
      </CreateUpdateBookingProvider>
    </DarkModeProvider>
  );
}

export default App;