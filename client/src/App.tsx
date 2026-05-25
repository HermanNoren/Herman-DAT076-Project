import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/app-layout";
import { LockSystemsPage } from "./pages/lock-systems";
import { LockSystemDetailPage } from "./pages/lock-system-detail";
import { OrdersPage } from "./pages/orders";
import { UsersPage } from "./pages/users";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="lock-systems" replace />} />
        <Route path="lock-systems" element={<LockSystemsPage />} />
        <Route path="lock-systems/:referenceCode" element={<LockSystemDetailPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>
    </Routes>
  );
}

export default App;
