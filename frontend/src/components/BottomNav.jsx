const navItems = [
  { id: "home", label: "စာရင်းသွင်း", icon: "+" },
  { id: "records", label: "မှတ်တမ်း", icon: "☰" },
  { id: "sheet", label: "စာရွက်", icon: "▦" },
  { id: "dashboard", label: "စုစုပေါင်း", icon: "∑" },
];

export default function BottomNav({ activePage, onNavigate }) {
  return (
    <nav className="bottom-nav" aria-label="အဓိက မီနူး">
      {navItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`bottom-nav__item ${activePage === item.id ? "is-active" : ""}`}
          onClick={() => onNavigate(item.id)}
        >
          <span aria-hidden="true" className="bottom-nav__icon">
            {item.icon}
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
