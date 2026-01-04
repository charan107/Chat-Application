import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginComplete, setLoginComplete] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    // Simulate API call delay
    setTimeout(() => {
      console.log('Login data:', formData);
      setIsLoggingIn(false);
      setLoginComplete(true);
      
      // Show success animation for 2 seconds before redirecting
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }, 1500);
  };
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">
          Sign in to continue chatting
        </p>

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
