import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import "./Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    profilePhoto: null,
    displayName: '',
    about: '',
    whoCanMessage: 'everyone',
    readReceipts: true,
    lastSeen: 'everyone'
  });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [cardTransition, setCardTransition] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const sendOTP = () => {
    setIsOtpSent(true);
    setOtpCountdown(30);
    // Simulate API call
    setTimeout(() => {
      console.log('OTP sent to:', formData.email);
    }, 500);
  };

  const resendOTP = () => {
    sendOTP();
  };

  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    } else {
      setIsOtpSent(false);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const verifyOTP = async () => {
    if (formData.otp.length !== 6) return;
    setIsVerifying(true);
    // Simulate API verification
    setTimeout(() => {
      setIsVerified(true);
      setTimeout(() => {
        setCardTransition(true);
        setTimeout(() => {
          setStep(3);
          setCardTransition(false);
        }, 500);
      }, 1000);
    }, 2000);
  };

  const nextStep = () => {
    if (step === 1) {
      sendOTP();
      setStep(2);
    } else if (step === 2) {
      if (isVerified) {
        setStep(3);
      } else {
        verifyOTP();
      }
    } else if (step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsRegistering(true);
    
    // Simulate API call delay
    setTimeout(() => {
      console.log('Registration data:', formData);
      setIsRegistering(false);
      setRegistrationComplete(true);
      
      // Show success animation for 2 seconds before redirecting
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="register-container">
      <div className={`register-card ${cardTransition ? 'card-transition' : ''}`}>
        <h1 className="register-title">
          {step === 1 && 'Create account'}
          {step === 2 && 'Verify your email'}
          {step === 3 && 'Set up your profile'}
          {step === 4 && 'Personalize your experience'}
        </h1>
        <p className="register-subtitle">
          {step === 1 && 'Join and start chatting instantly'}
          {step === 2 && (isVerified ? 'Email verified successfully!' : isOtpSent ? `OTP sent to ${formData.email}. Please wait ${otpCountdown} seconds before requesting another.` : 'Enter the verification code sent to your email')}
          {step === 3 && 'Make your profile unique and personal'}
          {step === 4 && 'Choose your privacy preferences'}
        </p>

        <form className={`register-form ${isRegistering || registrationComplete ? 'form-disabled' : ''}`} onSubmit={handleSubmit}>
          {step === 1 && (
            <>
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="otp-section">
                <input
                  type="text"
                  name="otp"
                  placeholder="Enter 6-digit code"
                  value={formData.otp}
                  onChange={handleInputChange}
                  maxLength="6"
                  required
                  disabled={isVerified}
                />
                <div className="otp-actions">
                  {!isOtpSent && !isVerified && (
                    <>
                      <button type="button" className="link-btn" onClick={sendOTP}>
                        Send OTP
                      </button>
                      <button type="button" className="link-btn" onClick={resendOTP}>
                        Resend
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="button-group">
                <Button type="button" variant="secondary" onClick={prevStep}>
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className={isVerifying ? 'loading' : isVerified ? 'success' : ''}
                  disabled={isVerifying || isVerified || formData.otp.length !== 6}
                >
                  {isVerifying ? (
                    <div className="loading-spinner"></div>
                  ) : isVerified ? (
                    <div className="success-check">✓</div>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="profile-photo-section">
                <label className="file-label">
                  Profile Photo (Optional)
                </label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="profilePhoto"
                    name="profilePhoto"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="file-input"
                  />
                  <div className="file-upload-content">
                    <div className="upload-icon">📷</div>
                    <div className="upload-text">
                      {formData.profilePhoto ? (
                        <span className="file-name">{formData.profilePhoto.name}</span>
                      ) : (
                        <>
                          <span className="upload-primary">Click to upload</span>
                          <span className="upload-secondary">or drag and drop</span>
                        </>
                      )}
                    </div>
                    <div className="upload-hint">PNG, JPG up to 5MB</div>
                  </div>
                </div>
              </div>
              <input
                type="text"
                name="displayName"
                placeholder="Display name"
                value={formData.displayName}
                onChange={handleInputChange}
                required
              />
              <textarea
                name="about"
                placeholder="About / Bio (one line)"
                value={formData.about}
                onChange={handleInputChange}
                rows="2"
                maxLength="100"
              />
              <div className="button-group">
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="preferences-section">
                <div className="preference-group">
                  <label>Who can message you?</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="whoCanMessage"
                        value="everyone"
                        checked={formData.whoCanMessage === 'everyone'}
                        onChange={handleInputChange}
                      />
                      <span className="radio-custom"></span>
                      <span className="radio-label">Everyone</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="whoCanMessage"
                        value="contacts"
                        checked={formData.whoCanMessage === 'contacts'}
                        onChange={handleInputChange}
                      />
                      <span className="radio-custom"></span>
                      <span className="radio-label">Contacts only</span>
                    </label>
                  </div>
                </div>

                <div className="preference-group">
                  <label>Read receipts</label>
                  <div className="toggle-group">
                    <label className="toggle-option">
                      <input
                        type="checkbox"
                        name="readReceipts"
                        checked={formData.readReceipts}
                        onChange={handleInputChange}
                      />
                      <span className="toggle-custom"></span>
                      <span className="toggle-label">On</span>
                    </label>
                  </div>
                </div>

                <div className="preference-group">
                  <label>Last seen</label>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="lastSeen"
                        value="everyone"
                        checked={formData.lastSeen === 'everyone'}
                        onChange={handleInputChange}
                      />
                      <span className="radio-custom"></span>
                      <span className="radio-label">Everyone</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="lastSeen"
                        value="contacts"
                        checked={formData.lastSeen === 'contacts'}
                        onChange={handleInputChange}
                      />
                      <span className="radio-custom"></span>
                      <span className="radio-label">Contacts</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="lastSeen"
                        value="nobody"
                        checked={formData.lastSeen === 'nobody'}
                        onChange={handleInputChange}
                      />
                      <span className="radio-custom"></span>
                      <span className="radio-label">Nobody</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="button-group">
                <Button type="button" variant="secondary" onClick={prevStep}>
                  Previous
                </Button>
                <Button type="submit" disabled={isRegistering || registrationComplete}>
                  {isRegistering ? (
                    <>
                      <div className="loading-spinner"></div>
                      Creating Account...
                    </>
                  ) : registrationComplete ? (
                    <>
                      <div className="success-checkmark">✓</div>
                      Registration Complete!
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              </div>
            </>
          )}
        </form>

        <div className="register-footer">
          <span>Already have an account?</span>
          <button className="link-btn" onClick={() => navigate('/login')}>Sign in</button>
        </div>
      </div>
    </div>
  );
};

export default Register;
