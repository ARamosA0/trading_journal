import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../authContext/context";

interface RequireRoleProps {
    roles: string[];
}

export default function RequireRole({ roles }: RequireRoleProps) {
    const { user } = useAuth();

    if (!user || !roles.includes(user.role.toUpperCase())) {
        return <Navigate to="/journal" replace />;
    }

    return <Outlet />;
}
