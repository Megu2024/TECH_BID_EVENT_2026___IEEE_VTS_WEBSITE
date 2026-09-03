import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import ContentManager from "../components/admin/ContentManager";
import TeamsManager from "../components/admin/TeamsManager";
import ControlsManager from "../components/admin/ControlsManager";
import ArenaManager from "../components/admin/ArenaManager";

function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("teams");
    const [teams, setTeams] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Shared Arena state
    const [arenaTeamId, setArenaTeamId] = useState("");

    // Catalog state (Used across different components)
    const [imageSets, setImageSets] = useState([]);
    const [cardsCatalog, setCardsCatalog] = useState([]);
    const [problemCatalog, setProblemCatalog] = useState([]);
    const [questions, setQuestions] = useState([]);

    // Global Confirm Modal
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        itemHighlight: "",
        confirmText: "Delete",
        confirmType: "danger",
        onConfirm: null,
    });

    const navigate = useNavigate();

    const loadAllData = useCallback(async () => {
        try {
            // Optimistic fast-load from localStorage
            const cachedData = localStorage.getItem('adminBootstrapCache');
            if (cachedData) {
                try {
                    const parsed = JSON.parse(cachedData);
                    setTeams(parsed.teams || []);
                    setSettings(parsed.settings || {});
                    setImageSets(parsed.imageSets || []);
                    setCardsCatalog(parsed.cardsCatalog || []);
                    setProblemCatalog(parsed.problemCatalog || []);
                    setQuestions(parsed.questions || []);
                    setLoading(false); // Instantly remove loading screen
                } catch(e) {}
            } else {
                setLoading(true);
            }

            const data = await api.getAdminBootstrap();
            
            // Cache the fresh data
            localStorage.setItem('adminBootstrapCache', JSON.stringify(data));

            setTeams(data.teams || []);
            setSettings(data.settings || {});
            
            // Note: In an extreme optimization scenario, we'd only load these if the relevant tab is active,
            // but the bootstrap payload has been optimized to exclude heavy image strings already.
            setImageSets(data.imageSets || []);
            setCardsCatalog(data.cardsCatalog || []);
            setProblemCatalog(data.problemCatalog || []);
            setQuestions(data.questions || []);

        } catch (err) {
            console.error(err);
            if (err.message && err.message.includes("No token") || err.message.includes("Invalid token")) {
                navigate("/admin/login");
            }
            setError("Failed to load admin data");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);

    const triggerConfirm = (title, message, itemHighlight, onConfirm, confirmText = "Confirm", confirmType = "danger") => {
        setConfirmModal({
            isOpen: true,
            title,
            message,
            itemHighlight,
            confirmText,
            confirmType,
            onConfirm: async () => {
                await onConfirm();
                setConfirmModal((prev) => ({ ...prev, isOpen: false }));
            },
        });
    };

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center", fontFamily: "monospace", color: "#00ffcc" }}>
                <h2>INITIALIZING ADMINISTRATOR CONSOLE...</h2>
                <div style={{ marginTop: "20px" }}>ESTABLISHING SECURE CONNECTION...</div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div>
                    <h1>System Administrator Console</h1>
                    <div className="status-indicator">
                        <span className="dot online"></span>
                        SYSTEM ONLINE
                    </div>
                </div>
                <div className="header-actions">
                    <button onClick={loadAllData} className="refresh-btn" disabled={actionLoading}>
                        {actionLoading ? "SYNCING..." : "SYNC DATA"}
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem("adminToken");
                            navigate("/admin/login");
                        }}
                        className="logout-btn"
                    >
                        TERMINATE SESSION
                    </button>
                </div>
            </header>

            {message && <div className="admin-alert success-alert">{message}</div>}
            {error && <div className="admin-alert error-alert">{error}</div>}

            <div className="admin-tabs">
                <button
                    className={activeTab === "teams" ? "active" : ""}
                    onClick={() => setActiveTab("teams")}
                >
                    Teams & Operations
                </button>
                <button
                    className={activeTab === "controls" ? "active" : ""}
                    onClick={() => setActiveTab("controls")}
                >
                    Game Controls & PINs
                </button>
                <button
                    className={activeTab === "r1g2_arena" ? "active" : ""}
                    onClick={() => setActiveTab("r1g2_arena")}
                >
                    R1G2 Judge Arena
                </button>
                <button
                    className={activeTab === "content" ? "active" : ""}
                    onClick={() => setActiveTab("content")}
                >
                    Content & Questions Manager
                </button>
            </div>

            <div className="admin-content-area">
                {activeTab === "teams" && (
                    <TeamsManager
                        teams={teams}
                        setTeams={setTeams}
                        cardsCatalog={cardsCatalog}
                        problemCatalog={problemCatalog}
                        actionLoading={actionLoading}
                        setActionLoading={setActionLoading}
                        setError={setError}
                        setMessage={setMessage}
                        loadAllData={loadAllData}
                        triggerConfirm={triggerConfirm}
                        setArenaTeamId={setArenaTeamId}
                        setActiveTab={setActiveTab}
                    />
                )}

                {activeTab === "controls" && settings && (
                    <ControlsManager
                        settings={settings}
                        setSettings={setSettings}
                        actionLoading={actionLoading}
                        setActionLoading={setActionLoading}
                        setError={setError}
                        setMessage={setMessage}
                    />
                )}

                {activeTab === "r1g2_arena" && (
                    <ArenaManager
                        teams={teams}
                        imageSets={imageSets}
                        setImageSets={setImageSets}
                        arenaTeamId={arenaTeamId}
                        setArenaTeamId={setArenaTeamId}
                        activeTab={activeTab}
                        actionLoading={actionLoading}
                        setActionLoading={setActionLoading}
                        setError={setError}
                        setMessage={setMessage}
                        loadAllData={loadAllData}
                    />
                )}

                {activeTab === "content" && (
                    <ContentManager
                        teams={teams}
                        imageSets={imageSets}
                        setImageSets={setImageSets}
                        cardsCatalog={cardsCatalog}
                        setCardsCatalog={setCardsCatalog}
                        problemCatalog={problemCatalog}
                        setProblemCatalog={setProblemCatalog}
                        questions={questions}
                        setQuestions={setQuestions}
                        actionLoading={actionLoading}
                        setActionLoading={setActionLoading}
                        setError={setError}
                        setMessage={setMessage}
                        loadAllData={loadAllData}
                        triggerConfirm={triggerConfirm}
                        activeTab={activeTab}
                    />
                )}
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                itemHighlight={confirmModal.itemHighlight}
                confirmText={confirmModal.confirmText}
                confirmType={confirmModal.confirmType}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                loading={actionLoading}
            />
        </div>
    );
}

export default AdminDashboard;
