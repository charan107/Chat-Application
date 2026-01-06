import { useState, useEffect } from "react";
import { loginUser } from "../../firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import Button from "../Button/Button";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginComplete, setLoginComplete] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);
    setLoginComplete(false);
    
    try {
      await loginUser(formData.email, formData.password);
      
      // Update user online status in Firestore
      // Note: user.uid will be available after login
      setLoginComplete(true);
      
      // Show success animation for 1 second before redirecting
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error("Login error:", err);
      
      // Convert Firebase error codes to user-friendly messages
      let errorMessage = "Login failed. Please try again.";
      
      if (err.code) {
        switch (err.code) {
          case 'auth/user-not-found':
            errorMessage = "No account found with this email.";
            break;
          case 'auth/wrong-password':
            errorMessage = "Incorrect password. Please try again.";
            break;
          case 'auth/invalid-email':
            errorMessage = "Please enter a valid email address.";
            break;
          case 'auth/too-many-requests':
            errorMessage = "Too many attempts. Please try again later.";
            break;
          case 'auth/network-request-failed':
            errorMessage = "Network error. Please check your connection.";
            break;
          default:
            errorMessage = err.message || errorMessage;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">
          Sign in to continue chatting
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

        <form className={`login-form ${isLoggingIn || loginComplete ? 'form-disabled' : ''}`} onSubmit={handleSubmit}>
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

          <Button type="submit" disabled={isLoggingIn || loginComplete}>
            {isLoggingIn ? (
              <>
                <div className="loading-spinner"></div>
                Signing In...
              </>
            ) : loginComplete ? (
              <>
                <div className="success-checkmark">✓</div>
                Welcome Back!
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="login-footer">
          <span>Don’t have an account?</span>
          <button className="link-btn" onClick={() => navigate('/register')}>Create one</button>
        </div>
      </div>
    </div>
  );
};

export default Login;
