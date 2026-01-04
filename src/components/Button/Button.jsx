import "./Button.css";

const Button = ({ children, variant = "primary", type = "button", onClick, className = "", ...props }) => {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      type={type}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;