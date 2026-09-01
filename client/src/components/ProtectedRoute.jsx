import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                minHeight: "70vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "16px",
            }}>
                <div style={{
                    width: "48px",
                    height: "48px",
                    border: "3px solid rgba(0, 240, 255, 0.2)",
                    borderTopColor: "var(--primary)",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                }} />
                <div style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "600" }}>
                    Verifying Credentials...
                </div>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!user) {
        return <Navigate to={requireAdmin ? "/admin/login" : "/login"} replace />;
    }

    if (requireAdmin && !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    if (!requireAdmin && isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

export default ProtectedRoute;
