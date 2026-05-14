import { useEffect, useState } from "react";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import RecordsPage from "./pages/RecordsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import SheetPage from "./pages/SheetPage.jsx";

const pages = {
  home: HomePage,
  records: RecordsPage,
  sheet: SheetPage,
  dashboard: DashboardPage,
};

function getInitialPage() {
  const hash = window.location.hash.replace("#", "");
  return pages[hash] ? hash : "home";
}

export default function App() {
  const [activePage, setActivePage] = useState(getInitialPage);
  const Page = pages[activePage];

  useEffect(() => {
    const onHashChange = () => setActivePage(getInitialPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function navigate(page) {
    window.location.hash = page;
    setActivePage(page);
  }

  return (
    <Layout activePage={activePage} onNavigate={navigate}>
      <Page />
    </Layout>
  );
}
