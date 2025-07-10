import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';
// Firebase imports removed - using backend verification instead
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import ErrorBoundary from '@/components/ErrorBoundary';

const ConsentContent = () => {
  const navigate = useNavigate();
  const { user, updateUserRole, login } = useAuth();
  const [currentRole, setCurrentRole] = useState(user?.role || 'buyer');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationDialog, setVerificationDialog] = useState({ open: false, type: null });
  const [contact, setContact] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStep, setVerificationStep] = useState('input');
  // Removed Firebase verification states and useEffect

  const handleRoleChange = async (newRole) => {
    if (currentRole === newRole) return;
    
    setIsLoading(true);
    try {
      await updateUserRole(newRole);
      toast.success(`Role updated to ${newRole} successfully`);
      setCurrentRole(newRole);
      navigate('/profile');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startVerification = async (type) => {
    setVerificationDialog({ open: true, type });
    setVerificationStep('input');
    setContact('');
    setVerificationCode('');
  };

  const handleSendVerification = async () => {
    try {
      setIsLoading(true);
      
      if (verificationDialog.type === 'phone') {
        // Send OTP via backend (you can implement SMS service here)
        const response = await axios.post('/api/verify/phone', {
          phone: contact,
        }, {
          withCredentials: true
        });

        if (response.data.success) {
          setVerificationStep('verify');
          toast.success('Verification code sent successfully');
        }
      } else {
        // Handle email verification
        const response = await axios.post('/api/verify/email', {
          email: contact,
        }, {
          withCredentials: true
        });

        if (response.data.success) {
          setVerificationStep('verify');
          toast.success('Verification email sent successfully');
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Error sending verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setIsLoading(true);

      if (verificationDialog.type === 'phone') {
        // Verify phone OTP via backend
        const response = await axios.post('/api/verify/phone/confirm', {
          code: verificationCode,
          phone: contact
        }, {
          withCredentials: true
        });

        if (response.data.success) {
          // Update backend about successful verification
          await axios.post('/verify', {
            type: 'phone',
            phone: contact
          }, {
            withCredentials: true
          });

          // Refresh user profile
          const { data: profileData } = await axios.get('/auth/me', {
            withCredentials: true
          });

          if (profileData.user) {
            login(profileData.user);
          }

          toast.success('Phone number verified successfully');
          setVerificationDialog({ open: false, type: null });
        }
      } else {
        // Handle email verification code
        const response = await axios.post('/api/verify/email/confirm', {
          code: verificationCode,
          email: contact
        }, {
          withCredentials: true
        });

        if (response.data.success) {
          const { data: profileData } = await axios.get('/auth/me', {
            withCredentials: true
          });

          if (profileData.user) {
            login(profileData.user);
          }

          toast.success('Email verified successfully');
          setVerificationDialog({ open: false, type: null });
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-lg font-semibold">Account Type</h2>
            <p className="text-gray-600">Choose your account type</p>
          </div>
          <div>
            <Button
              variant={currentRole === 'seller' ? "secondary" : "default"}
              onClick={() => handleRoleChange('seller')}
              disabled={isLoading || (currentRole === 'seller' && user?.role === 'seller')}
              className="min-w-[120px]"
            >
              {isLoading && currentRole !== 'seller' ? 'Updating...' : 
                currentRole === 'seller' ? 'Current Role' : 'Switch to Seller'}
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Important Notice</h3>
          <p className="text-sm text-gray-600">
            Switching to a seller account will allow you to list vehicles for sale. 
            You'll need to provide additional information and agree to our seller terms and conditions.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Account Verification</h2>
          <p className="text-gray-600">
            {user?.isVerified === true ? (
              <>
                Verified via {user.verifiedWith || 'unknown method'}
                {user.verifiedContact && ` (${user.verifiedContact})`}
              </>
            ) : (
              'Verify your account to access additional features'
            )}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Button
            variant="outline"
            className="border-orange-600 text-orange-600"
            onClick={() => startVerification('phone')}
            disabled={user?.isVerified || isLoading}
          >
            Verify via Phone
          </Button>
          <Button
            variant="outline"
            className="border-orange-600 text-orange-600"
            onClick={() => startVerification('email')}
            disabled={user?.isVerified || isLoading}
          >
            Verify via Email
          </Button>
        </div>
      </div>

      {/* reCAPTCHA container removed - no longer using Firebase */}

      {/* Verification Dialog */}
      <Dialog 
        open={verificationDialog.open}
        onOpenChange={(open) => !open && setVerificationDialog({ open: false, type: null })}
      >
        <DialogContent 
          className="sm:max-w-[425px]"
          aria-describedby="verification-dialog-description">
          <DialogHeader>
            <DialogTitle>
              {verificationStep === 'input' ? 'Enter Contact Information' : 'Enter Verification Code'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {verificationStep === 'input' ? (
              <>
                <Input
                  type={verificationDialog.type === 'phone' ? 'tel' : 'email'}
                  placeholder={verificationDialog.type === 'phone' ? 'Enter phone number (+1234567890)' : 'Enter email'}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
                <Button
                  onClick={handleSendVerification}
                  disabled={!contact || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </>
            ) : (
              <>
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <Button
                  onClick={handleVerifyCode}
                  disabled={!verificationCode || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Main component wrapped with ErrorBoundary
const Consent = () => (
  <ErrorBoundary>
    <ConsentContent />
  </ErrorBoundary>
);

export default Consent;





