import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Team() {
    const { user, team, refreshTeam } = useAuth();

    // Registration Form State
    const [teamName, setTeamName] = useState("");
    const [members, setMembers] = useState([
        { name: "", email: "" },
    ]);

    // Add Teammate to Existing Team State
    const [newMemberName, setNewMemberName] = useState("");
    const [newMemberEmail, setNewMemberEmail] = useState("");

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadTeamData = async () => {
        try {
            setLoading(true);
            setError("");
            await refreshTeam();
        } catch (err) {
            setError(err.message || "Failed to load team details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeamData();
    }, []);

    // Member row helpers for initial team registration
    const handleMemberChange = (index, field, value) => {
        const updated = [...members];
        updated[index][field] = value;
        setMembers(updated);
    };

    const addMemberRow = () => {
        if (members.length < 3) {
            setMembers([...members, { name: "", email: "" }]);
        }
    };

    const removeMemberRow = (index) => {
        setMembers(members.filter((_, i) => i !== index));
    };

    // 1. Create Team with members instantly
    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!teamName.trim()) {
            setError("Please enter a team name");
            return;
        }

        const validMembers = members.filter((m) => m.name?.trim() && m.email?.trim());

        try {
            setActionLoading(true);
            const data = await api.createTeam({
                teamName: teamName.trim(),
                members: validMembers,
            });

            setMessage(data.message || `Team "${teamName}" created successfully!`);
            setTeamName("");
            setMembers([{ name: "", email: "" }]);
            await refreshTeam();
        } catch (err) {
            setError(err.message || "Failed to create team");
        } finally {
            setActionLoading(false);
        }
    };

    // 2. Add teammate directly to existing team
    const handleAddMember = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!newMemberName.trim() || !newMemberEmail.trim()) {
            setError("Please enter both the name and email for the teammate");
            return;
        }

        try {
            setActionLoading(true);
            const data = await api.addTeamMember({
                name: newMemberName.trim(),
                email: newMemberEmail.trim(),
            });

            setMessage(data.message || "Teammate added successfully!");
            setNewMemberName("");
            setNewMemberEmail("");
            await refreshTeam();
        } catch (err) {
            setError(err.message || "Failed to add teammate");
        } finally {
            setActionLoading(false);
        }
    };

    // 3. Remove confirmed member
    const handleRemoveMember = async (memberId) => {
        setMessage("");
        setError("");

        try {
            setActionLoading(true);
            await api.removeTeamMember(memberId);
            setMessage("Member removed from team");
            await refreshTeam();
        } catch (err) {
            setError(err.message || "Failed to remove member");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar />
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>Loading team...</p>
                </div>
            </div>
        );
    }

    const isLeader = team && (team.leader?._id === user?.id || team.leader?._id === user?._id || team.leader === user?.id || team.leader === user?._id);
    const memberCount = team?.members?.length || 0;

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            <div style={{ maxWidth: "860px", margin: "36px auto 80px", padding: "0 20px", width: "100%" }}>
                
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                    <div>
                        <span className="badge badge-cyan" style={{ marginBottom: "6px" }}>
                            TEAM MANAGEMENT
                        </span>
                        <h1 style={{ fontSize: "30px", margin: 0 }}>
                            {team ? team.teamName : "Create Your Team"}
                        </h1>
                    </div>
                    {team && (
                        <Link to="/dashboard" className="btn-primary" style={{ padding: "10px 20px", fontSize: "14px" }}>
                            Go to Dashboard →
                        </Link>
                    )}
                </div>

                {message && (
                    <div style={{
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "1px solid rgba(16, 185, 129, 0.35)",
                        color: "#34d399",
                        padding: "12px 18px",
                        borderRadius: "10px",
                        fontSize: "14px",
                        marginBottom: "20px",
                    }}>
                        {message}
                    </div>
                )}

                {error && (
                    <div style={{
                        background: "rgba(244, 63, 94, 0.15)",
                        border: "1px solid rgba(244, 63, 94, 0.35)",
                        color: "#fb7185",
                        padding: "12px 18px",
                        borderRadius: "10px",
                        fontSize: "14px",
                        marginBottom: "20px",
                    }}>
                        {error}
                    </div>
                )}

                {!team ? (
                    /* ========================================================================= */
                    /* DIRECT TEAM REGISTRATION FORM */
                    /* ========================================================================= */
                    <div className="glass-card" style={{ padding: "36px" }}>
                        <div style={{ textAlign: "center", marginBottom: "28px" }}>
                            <div style={{ fontSize: "44px", marginBottom: "10px" }}>🚀</div>
                            <h2 style={{ fontSize: "24px", color: "#fff" }}>
                                Register Your Team
                            </h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
                                As team leader, enter your team name and add your teammates' names and email addresses. Only one phone/device is needed to play!
                            </p>
                        </div>

                        <form onSubmit={handleCreateTeam} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            
                            {/* Team Name */}
                            <div>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "var(--primary)", marginBottom: "6px", textTransform: "uppercase" }}>
                                    Team Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Tech Warriors"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Leader Info Display */}
                            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "16px", borderRadius: "10px" }}>
                                <span style={{ fontSize: "11px", color: "var(--accent-gold)", fontWeight: "700", textTransform: "uppercase" }}>
                                    Team Leader (You)
                                </span>
                                <div style={{ fontSize: "15px", fontWeight: "700", color: "#fff", marginTop: "4px" }}>
                                    {user?.name}
                                </div>
                                <div style={{ fontSize: "13px", color: "var(--text-dim)" }}>
                                    {user?.email}
                                </div>
                            </div>

                            {/* Teammates List */}
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                    <label style={{ fontSize: "13px", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase" }}>
                                        Team Members (Up to 3 Teammates)
                                    </label>
                                    {members.length < 3 && (
                                        <button
                                            type="button"
                                            onClick={addMemberRow}
                                            className="btn-secondary"
                                            style={{ padding: "4px 12px", fontSize: "12px" }}
                                        >
                                            + Add Another Teammate
                                        </button>
                                    )}
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {members.map((m, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "1fr 1.2fr auto",
                                                gap: "10px",
                                                alignItems: "center",
                                                background: "rgba(255, 255, 255, 0.02)",
                                                border: "1px solid rgba(255, 255, 255, 0.06)",
                                                padding: "12px",
                                                borderRadius: "10px",
                                            }}
                                        >
                                            <input
                                                type="text"
                                                placeholder={`Teammate ${idx + 1} Name`}
                                                value={m.name}
                                                onChange={(e) => handleMemberChange(idx, "name", e.target.value)}
                                            />
                                            <input
                                                type="email"
                                                placeholder={`teammate${idx + 1}@gmail.com`}
                                                value={m.email}
                                                onChange={(e) => handleMemberChange(idx, "email", e.target.value)}
                                            />
                                            {members.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeMemberRow(idx)}
                                                    className="btn-danger"
                                                    style={{ padding: "8px 12px", fontSize: "12px" }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={actionLoading}
                                style={{ padding: "14px", fontSize: "16px", marginTop: "10px" }}
                            >
                                {actionLoading ? "CREATING TEAM..." : "CREATE TEAM →"}
                            </button>
                        </form>
                    </div>
                ) : (
                    /* ========================================================================= */
                    /* TEAM ROSTER VIEW */
                    /* ========================================================================= */
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        
                        {/* Team Banner */}
                        <div className="glass-card" style={{ padding: "28px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
                                <div>
                                    <span style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>
                                        Team Name
                                    </span>
                                    <h2 style={{ fontSize: "26px", color: "#fff", margin: "2px 0 0" }}>
                                        {team.teamName}
                                    </h2>
                                </div>
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    background: "rgba(255, 215, 0, 0.1)",
                                    border: "1px solid rgba(255, 215, 0, 0.3)",
                                    padding: "6px 16px",
                                    borderRadius: "9999px",
                                    color: "#ffd700",
                                    fontWeight: "700",
                                }}>
                                    <span>🪙</span>
                                    <span>{team.techCoins || 0} Tech Coins</span>
                                </div>
                            </div>
                        </div>

                        {/* Confirmed Team Members List */}
                        <div className="glass-card" style={{ padding: "28px" }}>
                            <h3 style={{ fontSize: "18px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <span>👥</span> Team Members ({memberCount} / 4)
                            </h3>

                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {team.members?.map((member, idx) => (
                                    <div
                                        key={member._id || idx}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "14px 18px",
                                            borderRadius: "10px",
                                            background: "rgba(255, 255, 255, 0.02)",
                                            border: "1px solid rgba(255, 255, 255, 0.06)",
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <strong style={{ fontSize: "15px", color: "#fff" }}>
                                                    {member.name}
                                                </strong>
                                                {member.isLeader && (
                                                    <span className="badge badge-gold" style={{ fontSize: "10px", padding: "2px 8px" }}>
                                                        LEADER
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                                                {member.email}
                                            </div>
                                        </div>

                                        {isLeader && !member.isLeader && (
                                            <button
                                                onClick={() => handleRemoveMember(member._id || idx)}
                                                className="btn-danger"
                                                disabled={actionLoading}
                                                style={{ padding: "6px 12px", fontSize: "12px" }}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add Teammate Directly (if roster < 4) */}
                        {isLeader && memberCount < 4 && (
                            <div className="glass-card" style={{ padding: "28px" }}>
                                <h4 style={{ fontSize: "16px", marginBottom: "12px", color: "#fff" }}>
                                    Add Teammate to Roster
                                </h4>

                                <form onSubmit={handleAddMember} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                                    <input
                                        type="text"
                                        placeholder="Teammate Name"
                                        value={newMemberName}
                                        onChange={(e) => setNewMemberName(e.target.value)}
                                        style={{ flex: 1, minWidth: "180px" }}
                                        required
                                    />
                                    <input
                                        type="email"
                                        placeholder="teammate@gmail.com"
                                        value={newMemberEmail}
                                        onChange={(e) => setNewMemberEmail(e.target.value)}
                                        style={{ flex: 1.2, minWidth: "220px" }}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={actionLoading}
                                        style={{ padding: "10px 20px" }}
                                    >
                                        {actionLoading ? "Adding..." : "+ Add to Team"}
                                    </button>
                                </form>
                            </div>
                        )}

                    </div>
                )}

            </div>
        </div>
    );
}

export default Team;