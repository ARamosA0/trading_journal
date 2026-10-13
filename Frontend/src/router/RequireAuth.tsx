import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../authContext/context";

export default function RequireAuth() {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div>Verificando sesión...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
