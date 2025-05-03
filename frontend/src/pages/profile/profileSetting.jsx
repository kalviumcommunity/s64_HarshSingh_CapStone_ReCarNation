import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Shield, Mail } from "lucide-react";

const ProfileSettingsPage = () => {
  const navigate = useNavigate();
  const [isSeller, setIsSeller] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const validatePasswordForm = () => {
    const errors = {};
    
    if (!currentPassword) {
      errors.currentPassword = "Current password is required";
    } else if (currentPassword.length < 6) {
      errors.currentPassword = "Password must be at least 6 characters";
    }
    
    if (!newPassword) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < 6) {
      errors.newPassword = "New password must be at least 6 characters";
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (confirmPassword.length < 6) {
      errors.confirmPassword = "Password must be at least 6 characters";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }
    
    return errors;
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    const errors = validatePasswordForm();
    
    if (Object.keys(errors).length === 0) {
      // Here you would call your API to change the password
      console.log("Password change requested:", {
        currentPassword,
        newPassword,
        confirmPassword
      });
      
      // Show success message
      alert("Password changed successfully");
      
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFormErrors({});
    } else {
      setFormErrors(errors);
    }
  };

  const handleRoleToggle = () => {
    if (!isSeller) {
      // If turning on seller mode, trigger OTP verification
      setIsVerifying(true);
      // Simulate sending OTP
      setTimeout(() => {
        setOtpSent(true);
        alert("OTP sent to your registered contact");
      }, 1000);
    } else {
      // If turning off seller mode, just update the state
      setIsSeller(false);
    }
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input if value is entered
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
    
    // Check if OTP is complete
    if (newOtp.every(digit => digit) && newOtp.join("") === "123456") {
      setIsSeller(true);
      setIsVerifying(false);
      setOtpSent(false);
      alert("Verification successful! Seller account activated.");
    } else if (newOtp.every(digit => digit)) {
      alert("Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
    }
  };

  const resendOtp = () => {
    setOtpSent(true);
    alert("New OTP sent to your registered contact");
  };

  const cancelOtpVerification = () => {
    setIsVerifying(false);
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center mb-6">
            <User className="h-6 w-6 text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
          </div>
          
          {/* Password Change Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {formErrors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.currentPassword}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {formErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.newPassword}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>
              
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Password
              </button>
            </form>
          </div>
          
          {/* Role Toggle Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-5 w-5 text-gray-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Account Type</h2>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">
                  {isSeller ? "Seller Account" : "Buyer Account"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {isSeller 
                    ? "You can list vehicles for sale and manage inventory" 
                    : "Switch to seller account to list vehicles for sale"}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSeller}
                  onChange={handleRoleToggle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {isSeller && (
              <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-start">
                <div className="mr-3 mt-1 text-green-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-green-800 font-medium">Seller account active</p>
                  <p className="text-sm text-green-700">Your account has been verified and you can now list vehicles for sale.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* OTP Verification Dialog */}
      {isVerifying && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Seller Account Verification</h3>
              <p className="text-sm text-gray-500 mt-1">
                {otpSent 
                  ? "Enter the 6-digit code sent to your registered contact to verify your seller account" 
                  : "We're sending a verification code to your registered contact"}
              </p>
            </div>
            
            {otpSent ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>Code sent to: a***h@example.com</span>
                  </div>
                  
                  <div className="flex space-x-2 mt-2">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={otp[index]}
                        onChange={(e) => handleOtpChange(e.target.value, index)}
                        className="w-10 h-12 text-center text-lg border border-gray-300 rounded-md"
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between pt-2">
                  <button
                    onClick={cancelOtpVerification}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={resendOtp}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <button disabled className="px-4 py-2 bg-blue-600 text-white rounded-md opacity-75 cursor-not-allowed">
                  Sending verification code...
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

// Simple Header component
const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="font-bold text-xl text-gray-900">AutoMarket</div>
          <nav className="flex space-x-4">
            <a href="/" className="text-gray-600 hover:text-gray-900">Dashboard</a>
            <a href="/profile" className="text-blue-600 font-medium">Profile</a>
            <a href="/logout" className="text-gray-600 hover:text-gray-900">Logout</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

// Simple Footer component
const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-500 text-sm">&copy; 2025 AutoMarket. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a href="/terms" className="text-gray-500 hover:text-gray-700 text-sm">Terms</a>
            <a href="/privacy" className="text-gray-500 hover:text-gray-700 text-sm">Privacy</a>
            <a href="/contact" className="text-gray-500 hover:text-gray-700 text-sm">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ProfileSettingsPage;