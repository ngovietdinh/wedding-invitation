// App.jsx — Router đơn giản: / = thiệp, /admin = quản trị
import WeddingApp from "./WeddingApp";
import AdminPage  from "./AdminPage";

export default function App() {
  const isAdmin = window.location.pathname === "/admin";
  return isAdmin ? <AdminPage /> : <WeddingApp />;
}
