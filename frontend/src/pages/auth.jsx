import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, User, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginUser, registerUser } from "./apiService";
import { useAuth } from "@/context/AuthContext";

const Authentication = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === "/login";
  const { login: authLogin } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const validateForm = () => {
    // Reset previous error messages
    setError("");
    
    // Validation checks
    if (!email) {
      setError("Email is required");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (!isLoginPage && !name) {
      setError("Name is required");
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    // Password length validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      if (isLoginPage) {
        // Handle login
        const response = await loginUser({ email, password });
        
        if (response.user) {
          // Update auth context with user data
          await authLogin(response.user);
          setSuccess("Login successful!");
          // Immediately navigate to avoid delay
          navigate("/home");
        } else {
          throw new Error('Login failed - no user data received');
        }
      } else {
        // Handle registration
        await registerUser({ name, email, password });
        setSuccess("Registration successful! Please log in.");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Open Google OAuth popup
      const popup = window.open(
        `${API_BASE_URL}/api/auth/google`,
        "Google Auth",
        "width=600,height=600"
      );

      // Listen for message from popup
      const messageHandler = async (event) => {
        if (event.origin !== API_BASE_URL) return;

        // Handle the auth success message
        if (event.data.type === 'AUTH_SUCCESS' && event.data.user) {
          // Store user data in auth context
          await authLogin(event.data.user);
          setSuccess("Login successful!");
          
          // Remove event listener
          window.removeEventListener("message", messageHandler);
          
          // Navigate to home
          setTimeout(() => {
            navigate("/home");
          }, 1500);
        }
        
        setIsLoading(false);
      };

      // Add event listener for popup message
      window.addEventListener("message", messageHandler);
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-16">
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <svg
              viewBox="0 0 24 24"
              className="w-8 h-8 text-orange-600"
              fill="currentColor"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="text-xl font-bold">ReCarNation</span>
          </div>

          {/* Heading */}
          <div className="space-y-2 mb-8">
            <h4 className="text-gray-600">Start your journey</h4>
            <h1 className="text-2xl font-bold">
              {isLoginPage ? "Sign In to InsideBox" : "Sign Up to InsideBox"}
            </h1>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <Alert className="mb-4 bg-red-50 border-red-200 text-red-800">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginPage && (
              <div className="space-y-1">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-3 text-gray-400"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading 
                ? `${isLoginPage ? "Signing In..." : "Signing Up..."}` 
                : `${isLoginPage ? "Sign In" : "Sign Up"}`}
            </Button>

            {/* Google Authentication Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
              onClick={() => {
                window.location.href = `${API_BASE_URL}/api/auth/google`;
              }}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Continue with Google
            </Button>
          </form>

          {/* Switch between login and register */}
          <p className="mt-8 text-center text-sm text-gray-600">
            {isLoginPage ? "Don't have an account? " : "Have an account? "}
            <Link
              to={isLoginPage ? "/register" : "/login"}
              className="text-blue-600 hover:underline font-medium"
            >
              {isLoginPage ? "Sign Up" : "Sign In"}
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column - Background Image */}
      <div className="hidden lg:block lg:w-1/2 bg-center bg-cover bg-no-repeat relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(225deg, #FFE29F 0%, #FFA99F 48%, #FF719A 100%)",
            opacity: 0.9,
          }}
        ></div>
      </div>
    </div>
  );
};

export default Authentication;