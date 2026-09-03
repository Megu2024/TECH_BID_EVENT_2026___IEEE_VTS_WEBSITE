
import api from "../../services/api";

function ControlsManager({
    settings,
    setSettings,
    actionLoading,
    setActionLoading,
    setError,
    setMessage
}) {
    const generateRandomPin = (field) => {
        // eslint-disable-next-line
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        const updated = { ...settings, [field]: pin };
        setSettings(updated);
        handleUpdateSettings({ [field]: pin });
    };

    const handleUpdateSettings = async (updates) => {
        try {
            setActionLoading(true);
            const res = await api.updateEventSettings({ ...settings, ...updates });
            setSettings(res.settings);
            setMessage("Settings saved successfully!");
        } catch (err) {
            setError(err.message || "Failed to update settings");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div>
                            {/* ========================================================================= */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>

                        {/* Round 1 Game 1 Quiz Controls */}
                        <div className="glass-card" style={{ padding: "28px" }}>
                            <span className="badge badge-cyan" style={{ marginBottom: "10px" }}>ROUND 1 • GAME 1</span>
                            <h3 style={{ fontSize: "20px", marginBottom: "6px" }}>Speed Quiz Game</h3>
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                                10 Multiple Choice Questions • 10s Timer • 20 Tech Coins / Q
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-dim)", marginBottom: "6px" }}>
                                        Game PIN Code (Required for entry)
                                    </label>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            type="text"
                                            value={settings.r1g1Pin || ""}
                                            onChange={(e) => setSettings({ ...settings, r1g1Pin: e.target.value })}
                                            style={{ fontFamily: "var(--font-mono)", fontWeight: "700", textAlign: "center", fontSize: "18px" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => generateRandomPin("r1g1Pin")}
                                            className="btn-secondary"
                                            style={{ whiteSpace: "nowrap", padding: "8px 14px", fontSize: "13px" }}
                                            title="Generate New PIN"
                                        >
                                            🎲 New PIN
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "14px", fontWeight: "600" }}>Game Status:</span>
                                    <span className={settings.r1g1Enabled ? "badge badge-emerald" : "badge badge-rose"}>
                                        {settings.r1g1Enabled ? "ACTIVE / OPEN" : "LOCKED / DISABLED"}
                                    </span>
                                </div>

                                <button
                                    className={settings.r1g1Enabled ? "btn-secondary" : "btn-primary"}
                                    onClick={() => handleUpdateSettings({ r1g1Enabled: !settings.r1g1Enabled, r1g1Pin: settings.r1g1Pin })}
                                    disabled={actionLoading}
                                >
                                    {settings.r1g1Enabled ? "Disable Quiz Game" : "Enable Quiz Game"}
                                </button>
                            </div>
                        </div>

                        {/* Round 1 Game 3 Code Debugging Controls */}
                        <div className="glass-card" style={{ padding: "28px" }}>
                            <span className="badge badge-cyan" style={{ marginBottom: "10px" }}>ROUND 1 • GAME 3</span>
                            <h3 style={{ fontSize: "20px", marginBottom: "6px" }}>Code Output & Debugging</h3>
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                                10 Programming Snippets • 10s Timer • 20 Tech Coins / Q
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-dim)", marginBottom: "6px" }}>
                                        Game PIN Code (Required for entry)
                                    </label>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            type="text"
                                            value={settings.r1g3Pin || ""}
                                            onChange={(e) => setSettings({ ...settings, r1g3Pin: e.target.value })}
                                            style={{ fontFamily: "var(--font-mono)", fontWeight: "700", textAlign: "center", fontSize: "18px" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => generateRandomPin("r1g3Pin")}
                                            className="btn-secondary"
                                            style={{ whiteSpace: "nowrap", padding: "8px 14px", fontSize: "13px" }}
                                            title="Generate New PIN"
                                        >
                                            🎲 New PIN
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "14px", fontWeight: "600" }}>Game Status:</span>
                                    <span className={settings.r1g3Enabled ? "badge badge-emerald" : "badge badge-rose"}>
                                        {settings.r1g3Enabled ? "ACTIVE / OPEN" : "LOCKED / DISABLED"}
                                    </span>
                                </div>

                                <button
                                    className={settings.r1g3Enabled ? "btn-secondary" : "btn-primary"}
                                    onClick={() => handleUpdateSettings({ r1g3Enabled: !settings.r1g3Enabled, r1g3Pin: settings.r1g3Pin })}
                                    disabled={actionLoading}
                                >
                                    {settings.r1g3Enabled ? "Disable Code Game" : "Enable Code Game"}
                                </button>
                            </div>
                        </div>

                        {/* Round 4 Game 1 Jumbled Words Controls */}
                        <div className="glass-card" style={{ padding: "28px" }}>
                            <span className="badge badge-purple" style={{ marginBottom: "10px" }}>ROUND 4 • GAME 1</span>
                            <h3 style={{ fontSize: "20px", marginBottom: "6px" }}>Jumbled Technical Words</h3>
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                                10 Technical Words • 15s Timer • 30 Tech Coins / Q
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "12px", color: "var(--text-dim)", marginBottom: "6px" }}>
                                        Game PIN Code (Required for entry)
                                    </label>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input
                                            type="text"
                                            value={settings.r4g1Pin || ""}
                                            onChange={(e) => setSettings({ ...settings, r4g1Pin: e.target.value })}
                                            style={{ fontFamily: "var(--font-mono)", fontWeight: "700", textAlign: "center", fontSize: "18px" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => generateRandomPin("r4g1Pin")}
                                            className="btn-secondary"
                                            style={{ whiteSpace: "nowrap", padding: "8px 14px", fontSize: "13px" }}
                                            title="Generate New PIN"
                                        >
                                            🎲 New PIN
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "14px", fontWeight: "600" }}>Game Status:</span>
                                    <span className={settings.r4g1Enabled ? "badge badge-emerald" : "badge badge-rose"}>
                                        {settings.r4g1Enabled ? "ACTIVE / OPEN" : "LOCKED / DISABLED"}
                                    </span>
                                </div>

                                <button
                                    className={settings.r4g1Enabled ? "btn-secondary" : "btn-primary"}
                                    onClick={() => handleUpdateSettings({ r4g1Enabled: !settings.r4g1Enabled, r4g1Pin: settings.r4g1Pin })}
                                    disabled={actionLoading}
                                >
                                    {settings.r4g1Enabled ? "Disable Jumbled Game" : "Enable Jumbled Game"}
                                </button>
                            </div>
                        </div>

                        {/* Leaderboard Visibility Control */}
                        <div className="glass-card" style={{ padding: "28px" }}>
                            <span className="badge badge-gold" style={{ marginBottom: "10px" }}>PARTICIPANT LEADERBOARD</span>
                            <h3 style={{ fontSize: "20px", marginBottom: "6px" }}>Rankings Visibility</h3>
                            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
                                Control whether participants can see ranks and standings
                            </p>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "14px", fontWeight: "600" }}>Current Visibility:</span>
                                    <span className={settings.leaderboardVisible ? "badge badge-emerald" : "badge badge-purple"}>
                                        {settings.leaderboardVisible ? "VISIBLE TO ALL" : "HIDDEN (ADMIN ONLY)"}
                                    </span>
                                </div>

                                <button
                                    className={settings.leaderboardVisible ? "btn-secondary" : "btn-gold"}
                                    onClick={() => handleUpdateSettings({ leaderboardVisible: !settings.leaderboardVisible })}
                                    disabled={actionLoading}
                                >
                                    {settings.leaderboardVisible ? "Hide Rankings from Participants" : "Reveal Rankings to Participants 🏆"}
                                </button>
                            </div>
                        </div>

                    </div>


                {/* ========================================================================= */}
        </div>
    );
}

export default ControlsManager;
