import { useEffect } from "react";

function ConfirmModal({
    isOpen,
    title = "Confirm Action",
    message = "Are you sure you want to perform this action? This cannot be undone.",
    itemHighlight = "",
    confirmText = "Delete",
    cancelText = "Cancel",
    confirmType = "danger", // 'danger' | 'warning' | 'primary'
    onConfirm,
    onCancel,
    loading = false,
}) {
    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isOpen && !loading) {
                onCancel();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, loading, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(3, 7, 18, 0.82)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2000,
                padding: "20px",
                animation: "fadeIn 0.15s ease-out",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !loading) {
                    onCancel();
                }
            }}
        >
            <div
                className="glass-card"
                style={{
                    maxWidth: "460px",
                    width: "100%",
                    padding: "30px",
                    borderRadius: "16px",
                    border: confirmType === "danger"
                        ? "1px solid rgba(239, 68, 68, 0.4)"
                        : "1px solid rgba(255, 215, 0, 0.4)",
                    boxShadow: confirmType === "danger"
                        ? "0 0 35px rgba(239, 68, 68, 0.2)"
                        : "0 0 35px rgba(255, 215, 0, 0.15)",
                    position: "relative",
                    animation: "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
            >
                {/* Close X Button */}
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        background: "transparent",
                        border: "none",
                        color: "var(--text-muted)",
                        fontSize: "18px",
                        cursor: loading ? "not-allowed" : "pointer",
                        padding: "4px 8px",
                        lineHeight: 1,
                    }}
                >
                    ✕
                </button>

                {/* Header with Icon */}
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                    <div
                        style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "12px",
                            background: confirmType === "danger" ? "rgba(239, 68, 68, 0.15)" : "rgba(255, 215, 0, 0.15)",
                            border: confirmType === "danger" ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(255, 215, 0, 0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "22px",
                            flexShrink: 0,
                        }}
                    >
                        {confirmType === "danger" ? "🗑️" : "⚠️"}
                    </div>
                    <div>
                        <h3 style={{ fontSize: "19px", color: "#fff", margin: 0, fontWeight: "700" }}>
                            {title}
                        </h3>
                        <span style={{ fontSize: "11px", color: confirmType === "danger" ? "#f87171" : "var(--accent-gold)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            {confirmType === "danger" ? "Destructive Action" : "Confirmation Required"}
                        </span>
                    </div>
                </div>

                {/* Body Message */}
                <div style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "24px" }}>
                    <p style={{ margin: 0 }}>
                        {message}
                    </p>
                    {itemHighlight && (
                        <div
                            style={{
                                marginTop: "12px",
                                padding: "10px 14px",
                                borderRadius: "8px",
                                background: "rgba(255, 255, 255, 0.04)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                color: "#fff",
                                fontWeight: "700",
                                fontSize: "14px",
                                wordBreak: "break-word",
                            }}
                        >
                            "{itemHighlight}"
                        </div>
                    )}
                </div>

                {/* Actions Button Group */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="btn-secondary"
                        style={{ padding: "10px 20px", fontSize: "13px", fontWeight: "600" }}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={confirmType === "danger" ? "btn-danger" : "btn-primary"}
                        style={{
                            padding: "10px 22px",
                            fontSize: "13px",
                            fontWeight: "700",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        {loading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
