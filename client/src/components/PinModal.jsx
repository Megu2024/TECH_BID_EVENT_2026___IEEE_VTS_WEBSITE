import { useState } from "react";

function PinModal({ isOpen, onClose, onSubmit, gameTitle, loading, error }) {
    const [pin, setPin] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (pin.trim()) {
            onSubmit(pin.trim());
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(3, 7, 18, 0.85)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
        }}>
            <div className="glass-card" style={{
                maxWidth: "440px",
                width: "100%",
                padding: "36px",
                textAlign: "center",
                position: "relative",
                border: "1px solid rgba(0, 240, 255, 0.3)",
                boxShadow: "0 0 40px rgba(0, 240, 255, 0.15)",
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        background: "transparent",
                        border: "none",
                        color: "var(--text-muted)",
                        fontSize: "20px",
                        cursor: "pointer",
                    }}
                >
                    ✕
                </button>

                <div style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: "rgba(0, 240, 255, 0.1)",
                    border: "1px solid rgba(0, 240, 255, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    margin: "0 auto 18px",
                }}>
                    🔒
                </div>

                <h3 style={{ fontSize: "22px", marginBottom: "8px", color: "#fff" }}>
                    Enter Game PIN
                </h3>

                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px" }}>
                    Please enter the authorization PIN provided by the event administrator for <strong style={{ color: "var(--primary)" }}>{gameTitle}</strong>.
                </p>

                {error && (
                    <div style={{
                        background: "rgba(244, 63, 94, 0.15)",
                        border: "1px solid rgba(244, 63, 94, 0.3)",
                        color: "#fb7185",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        marginBottom: "18px",
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="ENTER PINCODE"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        autoFocus
                        style={{
                            textAlign: "center",
                            fontSize: "22px",
                            letterSpacing: "0.25em",
                            fontWeight: "700",
                            fontFamily: "var(--font-mono)",
                            marginBottom: "20px",
                            textTransform: "uppercase",
                        }}
                    />

                    <div style={{ display: "flex", gap: "12px" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary"
                            style={{ flex: 1 }}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            style={{ flex: 1 }}
                            disabled={loading || !pin.trim()}
                        >
                            {loading ? "Verifying..." : "Enter Game →"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PinModal;
