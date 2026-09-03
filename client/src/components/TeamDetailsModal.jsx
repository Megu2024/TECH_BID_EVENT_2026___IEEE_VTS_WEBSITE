import React from "react";

function TeamDetailsModal({ team, isOpen, onClose }) {
    if (!isOpen || !team) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.8)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2000,
                padding: "20px",
            }}
        >
            <div
                className="glass-card"
                style={{
                    maxWidth: "600px",
                    width: "100%",
                    padding: "32px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    position: "relative",
                    border: "1px solid rgba(0, 240, 255, 0.3)",
                    boxShadow: "0 0 40px rgba(0, 240, 255, 0.15)",
                }}
            >
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

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                        <span className="badge badge-gold" style={{ marginBottom: "4px" }}>
                            {team.rank ? `RANK #${team.rank}` : "UNRANKED"}
                        </span>
                        <h2 style={{ fontSize: "26px", color: "#fff", margin: 0 }}>
                            {team.teamName}
                        </h2>
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#ffd700", fontFamily: "var(--font-mono)" }}>
                        🪙 {team.finalScore || 0} Coins
                    </div>
                </div>

                {/* Leader & Members Roster */}
                <div style={{ marginBottom: "24px" }}>
                    <h4 style={{ fontSize: "14px", color: "var(--primary)", textTransform: "uppercase", marginBottom: "10px" }}>
                        Team Members Roster
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {team.members?.map((m, idx) => (
                            <div key={m._id || idx} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.03)" }}>
                                <div>
                                    <strong style={{ color: "#fff", fontSize: "14px" }}>{m.name}</strong>
                                    {m.isLeader && <span className="badge badge-gold" style={{ marginLeft: "8px", fontSize: "10px" }}>LEADER</span>}
                                    <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>{m.email}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Scores Breakdown */}
                <div style={{ marginBottom: "24px" }}>
                    <h4 style={{ fontSize: "14px", color: "var(--primary)", textTransform: "uppercase", marginBottom: "10px" }}>
                        Competition Scoring Breakdown
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
                        <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                            <span style={{ color: "var(--text-dim)" }}>Round 1 Game 1 (Quiz):</span>
                            <strong style={{ display: "block", color: "#fff" }}>🪙 {team.round1?.game1Score || 0}</strong>
                        </div>
                        <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                            <span style={{ color: "var(--text-dim)" }}>Round 1 Game 2 (Images):</span>
                            <strong style={{ display: "block", color: "#fff" }}>🪙 {team.round1?.game2Score || 0}</strong>
                        </div>
                        <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                            <span style={{ color: "var(--text-dim)" }}>Round 1 Game 3 (Code):</span>
                            <strong style={{ display: "block", color: "#fff" }}>🪙 {team.round1?.game3Score || 0}</strong>
                        </div>
                        <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                            <span style={{ color: "var(--text-dim)" }}>Round 4 Game 1 (Jumbled):</span>
                            <strong style={{ display: "block", color: "#fff" }}>🪙 {team.round4?.game1Score || 0}</strong>
                        </div>
                        <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                            <span style={{ color: "var(--text-dim)" }}>Round 4 Game 2 (Resistor):</span>
                            <strong style={{ display: "block", color: "#fff" }}>🪙 {team.round4?.game2Score || 0}</strong>
                        </div>
                        <div style={{ padding: "10px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "8px" }}>
                            <span style={{ color: "var(--text-dim)" }}>Round 5 Score:</span>
                            <strong style={{ display: "block", color: "#fff" }}>🪙 {team.round5?.finalEvaluationScore || 0}</strong>
                        </div>
                    </div>
                </div>

                {/* Tech Cards & Problem Statement */}
                <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ fontSize: "14px", color: "var(--primary)", textTransform: "uppercase", marginBottom: "8px" }}>
                        Tech Cards Possessed ({team.techCards?.length || 0})
                    </h4>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {team.techCards?.length > 0 ? (
                            team.techCards.map((c, idx) => (
                                <span key={idx} className="badge badge-gold" style={{ fontSize: "11px" }}>
                                    🎴 {c.name} (Bought: 🪙{c.boughtPrice !== undefined && c.boughtPrice !== null ? c.boughtPrice : (c.basePrice || 0)} | Market: 🪙{c.marketValue})
                                </span>
                            ))
                        ) : (
                            <span style={{ fontSize: "13px", color: "var(--text-dim)" }}>No Tech Cards assigned yet</span>
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                    <h4 style={{ fontSize: "14px", color: "var(--primary)", textTransform: "uppercase", marginBottom: "6px" }}>
                        Assigned Problem Statement
                    </h4>
                    <div style={{ fontSize: "14px", color: "#fff" }}>
                        {team.problemStatement || "None assigned yet (Pending Round 5 Auction)"}
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="btn-secondary"
                    style={{ width: "100%", padding: "10px" }}
                >
                    Close Details
                </button>
            </div>
        </div>
    );
}

export default TeamDetailsModal;
