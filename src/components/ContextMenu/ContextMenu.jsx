import "./ContextMenu.css";

const ContextMenu = ({ items = [], onClose, position = {} }) => {
  return (
    <div className="context-menu" style={position}>
      {items.map((item, index) => (
        <div
          key={index}
          className="context-menu-item"
          onClick={() => {
            item.onClick?.();
            onClose?.();
          }}
        >
          {item.icon && <item.icon />}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;
