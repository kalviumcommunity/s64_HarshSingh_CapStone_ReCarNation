import { store } from '../store';
import { logout } from '../store/slices/authSlice';

export const checkAuth = () => {
  const state = store.getState();
  const { isAuthenticated, user } = state.auth;

  console.log('checkAuth Debug - Initial State:', {
    isAuthenticated,
    user,
    fullAuthState: state.auth
  });

  // If we're already authenticated in Redux, return true
  if (isAuthenticated) {
    console.log('checkAuth: Already authenticated in Redux');
    return true;
  }

  // Check if we have a user in Redux but not authenticated
  // This could happen after a page refresh
  if (user) {
    console.log('checkAuth: User exists but not authenticated, validating session...');
    // Make a request to validate the session using the /me endpoint
    return fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      credentials: 'include', // Important: This ensures cookies are sent
    })
      .then(response => {
        console.log('checkAuth: Validation response:', {
          status: response.status,
          ok: response.ok
        });
        
        if (response.ok) {
          return response.json().then(userData => {
            console.log('checkAuth: Session validated successfully', { userData });
            store.dispatch({
              type: 'auth/loginSuccess',
              payload: {
                user: userData
              }
            });
            return true;
          });
        }
        
        console.log('checkAuth: Session validation failed');
        store.dispatch(logout());
        return false;
      })
      .catch(error => {
        console.error('checkAuth: Validation request failed:', error);
        store.dispatch(logout());
        return false;
      });
  }

  console.log('checkAuth: No user in state, not authenticated');
  return false;
}; 