import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";

function JoinTeam() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();
    const { user, login } = useAuth();

    const [inviteData, setInviteData] = useState(null);
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDetails = async () => {
            if (!token) {
                setError("No invitation token found in link.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await api.getInviteDetails(token);
                setInviteData(data);
                if (data.memberName) setName(data.memberName);
            } catch (err) {
                setError(err.message || "This invitation link is invalid or expired.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [token]);

    const handleConfirm = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setSubmitting(true);
            const res = await api.confirmJoinTeam({
                token,
                name: name.trim() || inviteData?.memberName,
                password,
            });

            if (res.token && res.user) {
                login(res.token, res.user);
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.message || "Failed to join team. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 20px",
            }}>
                <div className="glass-card" style={{
                    maxWidth: "520px",
                    width: "100%",
                    padding: "40px",
                    textAlign: "center",
                }}>
                    <div style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "18px",
                        background: "linear-gradient(135deg, #00f0ff 0%, #7000ff 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "32px",
                        margin: "0 auto 20px",
                        boxShadow: "0 0 30px rgba(0, 240, 255, 0.3)",
                    }}>
                        🤝
                    </div>

                    <span className="badge badge-cyan" style={{ marginBottom: "12px" }}>
                        OFFICIAL TEAM INVITATION
                    </span>

                    <h1 style={{ fontSize: "28px", marginTop: "4px", marginBottom: "10px" }}>
                        Join Your Competition Team
                    </h1>

                    {loading ? (
                        <p style={{ color: "var(--text-muted)", fontSize: "15px", padding: "30px 0" }}>
                            Verifying invitation link...
                        </p>
                    ) : error ? (
                        <div>
                            <div style={{
                                background: "rgba(244, 63, 94, 0.15)",
                                border: "1px solid rgba(244, 63, 94, 0.35)",
                                color: "#fb7185",
                                padding: "14px 18px",
                                borderRadius: "10px",
                                fontSize: "14px",
                                margin: "20px 0",
                            }}>
                                {error}
                            </div>
                            <Link to="/" className="btn-primary" style={{ padding: "10px 24px" }}>
                                Back to Home
                            </Link>
                        </div>
                    ) : inviteData ? (
                        <div>
                            {/* Invitation Details Banner */}
                            <div style={{
                                background: "rgba(255, 255, 255, 0.03)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                borderRadius: "14px",
                                padding: "20px",
                                textAlign: "left",
                                margin: "20px 0 24px",
                            }}>
                                <div style={{ fontSize: "12px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>
                                    Team Name
                                </div>
                                <div style={{ fontSize: "22px", fontWeight: "900", color: "#fff", marginTop: "2px" }}>
                                    {inviteData.teamName}
                                </div>
                                <div style={{ fontSize: "13px", color: "var(--primary)", marginTop: "6px" }}>
                                    Invited by Leader: <strong>{inviteData.leaderName}</strong>
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
                                    Invited Email: {inviteData.memberEmail}
                                </div>
                            </div>

                            <form onSubmit={handleConfirm} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                                        Your Full Name
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                {!user && (
                                    <div>
                                        <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "var(--text-muted)", marginBottom: "6px" }}>
                                            Choose Account Password (min. 6 characters)
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            minLength={6}
                                            required
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={submitting}
                                    style={{ width: "100%", padding: "14px", fontSize: "16px", marginTop: "8px" }}
                                >
                                    {submitting ? "Joining Team..." : "Confirm & Join Team →"}
                                </button>
                            </form>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default JoinTeam;
