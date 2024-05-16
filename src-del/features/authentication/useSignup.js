import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { signup as signupApi } from '../../services/apiAuth';

export function useSignup() {
  const { mutate: signup, isLoading: isSigningUp } = useMutation({
    mutationFn: ({ fullName, email, password }) =>
      signupApi({ fullName, email, password }),
    onSuccess: (user) => {
      toast.success(
        "Account successfully created! Please confirm the new account from the user's email address"
      );
    },
    onError: (error) => {
      console.error(error.message);
      toast.error(error.message);
    },
  });

  return { signup, isSigningUp };
}
