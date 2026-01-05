import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import "./Register.css";
import { registerUser } from "../../firebase/auth";
import { db, storage } from "../../firebase/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
    profilePhoto: null,
    displayName: '',
    about: '',
    whoCanMessage: 'everyone',
    readReceipts: true,
    lastSeen: 'everyone'
  });
  const [cardTransition, setCardTransition] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [error, setError] = useState(null);

  // Handle navigation when registration completes
  useEffect(() => {
    if (registrationComplete && !isRegistering) {
      console.log("Registration complete, setting up navigation...");
      const timer = setTimeout(() => {
        console.log("Navigating to login...");
        navigate("/login", { replace: true });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [registrationComplete, isRegistering, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegistrationComplete(false);
    setError(null); // Clear any previous errors

    try {
      console.log("Starting registration...");
      
      // 1️⃣ Create Auth user
      console.log("Creating Firebase Auth user...");
      const userCredential = await registerUser(
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      console.log("Auth user created:", user.uid);
      
      let photoURL = "";

      // 2️⃣ Upload profile photo (if exists)
      if (formData.profilePhoto) {
        try {
          console.log("Uploading profile photo...");
          const photoRef = ref(
            storage,
            `profile-images/${user.uid}`
          );

          await uploadBytes(photoRef, formData.profilePhoto);
          photoURL = await getDownloadURL(photoRef);
          console.log("Photo uploaded:", photoURL);
        } catch (uploadError) {
          console.error("Photo upload error:", uploadError);
          // Continue registration even if photo upload fails
        }
      }

      // 3️⃣ Save complete user profile + preferences (Firestore)
      console.log("Saving user data to Firestore...");
      const userData = {
        // Basic Information
        uid: user.uid,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        displayName: formData.displayName || `${formData.firstName} ${formData.lastName}`,
        fullName: `${formData.firstName} ${formData.lastName}`,
        about: formData.about || '',
        photoURL: photoURL || '',
        
        // Preferences
        preferences: {
          whoCanMessage: formData.whoCanMessage,
          readReceipts: formData.readReceipts,
          lastSeen: formData.lastSeen,
        },
        
        // Status & Activity
        isOnline: false,
        lastSeenTimestamp: serverTimestamp(),
        status: 'offline', // online, offline, away
        
        // Chat-related data
        // Note: chatIds is optional - chats are queried using members array
        // Keeping it for potential future use (caching, quick access)
        chatIds: [], // Optional: Array of chat IDs (not required for queries)
        unreadCount: 0, // Total unread messages across all chats
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Save to Firestore with timeout and error handling
      const firestorePromise = setDoc(doc(db, "users", user.uid), userData);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Firestore operation timed out after 5 seconds")), 5000)
      );

      try {
        await Promise.race([firestorePromise, timeoutPromise]);
        console.log("User data saved to Firestore successfully");
      } catch (firestoreError) {
        console.error("Firestore save error:", firestoreError);
        // Even if Firestore fails, user is created in Auth, so continue with registration
        // The user can update their profile later
        console.warn("Continuing registration despite Firestore error - user is authenticated");
        // Don't show error since registration succeeded - profile can be updated later
      }

      // 4️⃣ Success UI - Update states
      console.log("Registration complete, updating UI...");
      
      // Clear any errors and update states - useEffect will handle navigation
      setError(null);
      setIsRegistering(false);
      setRegistrationComplete(true);

    } catch (error) {
      console.error("Registration error:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      setIsRegistering(false);
      setRegistrationComplete(false);
      
      // Convert Firebase error codes to user-friendly messages
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = "This email is already registered. Please use a different email or try logging in.";
            break;
          case 'auth/invalid-email':
            errorMessage = "Please enter a valid email address.";
            break;
          case 'auth/operation-not-allowed':
            errorMessage = "Email/password accounts are not enabled. Please contact support.";
            break;
          case 'auth/weak-password':
            errorMessage = "Password is too weak. Please use at least 6 characters.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Network error. Please check your internet connection and try again.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Too many attempts. Please try again later.";
            break;
          default:
            errorMessage = error.message || "Registration failed. Please try again.";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    }
  };


  return (
    <div className="register-container">
      <div className={`register-card ${cardTransition ? 'card-transition' : ''}`}>
        <h1 className="register-title">
          {step === 1 && 'Create account'}
          {step === 2 && 'Set up your profile'}
          {step === 3 && 'Personalize your experience'}
        </h1>
        <p className="register-subtitle">
          {step === 1 && 'Join and start chatting instantly'}
          {step === 2 && 'Make your profile unique and personal'}
          {step === 3 && 'Choose your privacy preferences'}
        </p>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #fcc',
            fontSize: '14px',
            lineHeight: '1.5',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

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
                <Button type="button" variant="secondary" onClick={prevStep}>
                  Previous
                </Button>
                <Button type="button" onClick={nextStep}>
                  Next
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
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
