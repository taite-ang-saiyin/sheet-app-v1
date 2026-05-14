import BottomNav from "./BottomNav.jsx";

export default function Layout({ activePage, onNavigate, children }) {
  return (
    <div className="app-shell">
      <main className="app-main">{children}</main>
      <BottomNav activePage={activePage} onNavigate={onNavigate} />
    </div>
  );
}
