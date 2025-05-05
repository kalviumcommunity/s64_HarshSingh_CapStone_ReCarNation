import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, User, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser } from "../store/slices/authSlice";

const Authentication = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === "/login";
  const dispatch = useDispatch();
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
    setError("");
    setSuccess("");
    
    try {
      if (isLoginPage) {
        // Handle login using Redux
        const result = await dispatch(loginUser({ email, password })).unwrap();
        setSuccess("Login successful!");
        
        // Redirect to profile page after successful login
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      } else {
        // Handle registration using Redux
        const result = await dispatch(registerUser({ name, email, password })).unwrap();
        setSuccess("Registration successful! Please log in.");
        
        // Redirect to login page after successful registration
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    }
  };

  const handleGoogleAuth = async () => {
    try {
      setError("");
      
      // Open Google OAuth popup
      const popup = window.open(
        "http://localhost:3000/api/auth/google",
        "Google Auth",
        "width=600,height=600"
      );

      // Listen for message from popup
      window.addEventListener("message", async (event) => {
        if (event.origin !== "http://localhost:3000") return;
        
        if (event.data.token && event.data.user) {
          // Dispatch login action with Google auth data
          await dispatch(loginUser({
            email: event.data.user.email,
            password: event.data.token // Using token as password for Google auth
          })).unwrap();
          
          setSuccess("Login successful!");
          setTimeout(() => {
            navigate("/home");
          }, 1500);
        } else {
          setError("Google authentication failed. Please try again.");
        }
      });
    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
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
                    disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Loading..." : (isLoginPage ? "Sign In" : "Sign Up")}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isLoginPage ? "Don't have an account?" : "Already have an account?"}{" "}
                <Link
                  to={isLoginPage ? "/register" : "/login"}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {isLoginPage ? "Sign Up" : "Sign In"}
                </Link>
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
              </svg>
              Google
            </Button>
          </form>
        </div>
      </div>

      {/* Right Column - Orange Background */}
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