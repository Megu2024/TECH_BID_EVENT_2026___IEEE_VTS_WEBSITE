import Navbar from "../components/Navbar";

function EventInfo() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            <div style={{ maxWidth: "1050px", margin: "40px auto 80px", padding: "0 24px", width: "100%" }}>

                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "44px" }}>
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "6px 16px 6px 8px",
                        borderRadius: "9999px",
                        background: "rgba(0, 240, 255, 0.08)",
                        border: "1px solid rgba(0, 240, 255, 0.25)",
                        marginBottom: "16px",
                    }}>
                        <div style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            background: "#fff",
                            padding: "2px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                        }}>
                            <img src="/vts-logo.png" alt="IEEE VTS" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                        <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: "700", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            EVENT FLOW & RULEBOOK
                        </span>
                    </div>

                    <h1 style={{
                        fontSize: "clamp(34px, 5vw, 48px)",
                        fontWeight: "900",
                        marginBottom: "12px",
                        letterSpacing: "-0.02em",
                    }}>
                        TECH BID <span className="gradient-text-cyan">COMPETITION GUIDE</span>
                    </h1>
                    <p style={{
                        color: "#cbd5e1",
                        fontSize: "17px",
                        maxWidth: "760px",
                        margin: "0 auto",
                        lineHeight: 1.65,
                    }}>
                        Complete round breakdown, gameplay rules, coin limits, and strategic scoring for all 5 competition stages.
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

                    {/* ROUND 1 */}
                    <div className="glass-card" style={{ padding: "32px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span className="badge badge-cyan">STAGE 1</span>
                                <h2 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>
                                    Round 1 – Technical Challenge
                                </h2>
                            </div>
                            <span className="badge badge-gold" style={{ fontSize: "12.5px" }}>
                                🪙 Max 1,000 Tech Coins
                            </span>
                        </div>

                        <p style={{ color: "var(--text-muted)", fontSize: "14.5px", lineHeight: 1.6, marginBottom: "20px" }}>
                            Consists of 3 distinct technical games testing engineering breadth, lateral thinking, and programming logic. Tech Coins earned here fuel the auction in Round 2.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div style={{ padding: "18px 20px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                    <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "700", margin: 0 }}>1️⃣ Quiz</h3>
                                    <span style={{ fontSize: "12.5px", color: "var(--accent-gold)", fontWeight: "700" }}>🪙 Max 300 Coins</span>
                                </div>
                                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
                                    Participants answer technical questions covering both Hardware and Software to test knowledge and fundamental concepts.
                                </p>
                            </div>

                            <div style={{ padding: "18px 20px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                    <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "700", margin: 0 }}>2️⃣ Connection</h3>
                                    <span style={{ fontSize: "12.5px", color: "var(--accent-gold)", fontWeight: "700" }}>🪙 Max 400 Coins</span>
                                </div>
                                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
                                    Participants identify the common connection between given visual clues/images to determine the correct technical term, testing observation and lateral thinking.
                                </p>
                            </div>

                            <div style={{ padding: "18px 20px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                    <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "700", margin: 0 }}>3️⃣ Output Guessing & Debugging</h3>
                                    <span style={{ fontSize: "12.5px", color: "var(--accent-gold)", fontWeight: "700" }}>🪙 Max 300 Coins</span>
                                </div>
                                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
                                    Participants predict the output or identify and fix bugs in code snippets to evaluate algorithmic programming logic.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ROUND 2 */}
                    <div className="glass-card" style={{ padding: "32px" }}>
                        <span className="badge badge-gold" style={{ marginBottom: "12px" }}>STAGE 2</span>
                        <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "14px" }}>
                            Round 2 – Tech Auction
                        </h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "14.5px", lineHeight: 1.65, marginBottom: "18px" }}>
                            Live auction where participants spend Round 1 Tech Coins to strategically bid on Technology Cards (e.g., AI, IoT, 5G, EV, BMS, Vision Processors).
                        </p>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                            gap: "14px",
                            background: "rgba(255, 255, 255, 0.02)",
                            padding: "18px 20px",
                            borderRadius: "12px",
                            border: "1px solid rgba(255, 255, 255, 0.06)",
                        }}>
                            <div>
                                <strong style={{ color: "var(--primary)", fontSize: "14.5px", display: "block", marginBottom: "4px" }}>
                                    🎴 Card Limits
                                </strong>
                                <span style={{ fontSize: "13.5px", color: "var(--text-dim)", lineHeight: 1.5, display: "block" }}>
                                    Each team must hold a <strong>Minimum of 2</strong> and a <strong>Maximum of 4</strong> Technology Cards.
                                </span>
                            </div>
                            <div>
                                <strong style={{ color: "var(--accent-gold)", fontSize: "14.5px", display: "block", marginBottom: "4px" }}>
                                    📈 Market Hike & 📉 Market Crash
                                </strong>
                                <span style={{ fontSize: "13.5px", color: "var(--text-dim)", lineHeight: 1.5, display: "block" }}>
                                    Card market values fluctuate dynamically after purchase. Final asset worth is calculated using live market values.
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ROUND 3 */}
                    <div className="glass-card" style={{ padding: "32px" }}>
                        <span className="badge badge-purple" style={{ marginBottom: "12px" }}>STAGE 3</span>
                        <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "14px" }}>
                            Round 3 – Tech Challenge Selection 🧠💡
                        </h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "14.5px", lineHeight: 1.65, marginBottom: "16px" }}>
                            All available Tech Challenge statements are presented. Teams analyze the challenges to evaluate how well they align with their acquired Technology Cards.
                        </p>
                        <ul style={{ color: "var(--text-body)", paddingLeft: "20px", fontSize: "14px", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: "6px" }}>
                            <li>Identify and shortlist the Tech Challenges that best match your owned cards.</li>
                            <li>Shortlisted statements serve as primary and backup options for the final bidding round.</li>
                            <li><strong>Strategic Focus:</strong> No solution needs to be developed at this stage, focus entirely on matching and tactical planning.</li>
                        </ul>
                    </div>

                    {/* ROUND 4 */}
                    <div className="glass-card" style={{ padding: "32px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span className="badge badge-cyan">STAGE 4</span>
                                <h2 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>
                                    Round 4 – Technical Challenge 2
                                </h2>
                            </div>
                            <span className="badge badge-gold" style={{ fontSize: "12.5px" }}>
                                🪙 Max 800 Tech Coins
                            </span>
                        </div>

                        <p style={{ color: "var(--text-muted)", fontSize: "14.5px", lineHeight: 1.6, marginBottom: "20px" }}>
                            Teams compete in two technical games to earn additional Tech Coins needed for the final high-stakes auction in Round 5.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div style={{ padding: "18px 20px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                    <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "700", margin: 0 }}>1️⃣ Jumbled Technical Words</h3>
                                    <span style={{ fontSize: "12.5px", color: "var(--accent-gold)", fontWeight: "700" }}>🪙 Max 500 Coins</span>
                                </div>
                                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
                                    Technical terms are presented in a jumbled format. Participants rearrange the letters to identify the correct term across escalating difficulty levels.
                                </p>
                            </div>

                            <div style={{ padding: "18px 20px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                    <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "700", margin: 0 }}>2️⃣ Resistance Challenge ⚡</h3>
                                    <span style={{ fontSize: "12.5px", color: "var(--accent-gold)", fontWeight: "700" }}>🪙 Max 300 Coins</span>
                                </div>
                                <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
                                    Participants are provided with different resistor values, connect them in series or parallel as specified, and calculate equivalent circuit resistance.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ROUND 5 */}
                    <div className="glass-card" style={{ padding: "32px", border: "1px solid rgba(0, 240, 255, 0.35)" }}>
                        <span className="badge badge-gold" style={{ marginBottom: "12px" }}>STAGE 5</span>
                        <h2 style={{ fontSize: "22px", fontWeight: "800", marginBottom: "14px" }}>
                            Round 5 – Tech Challenge Bidding & Defense
                        </h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "14.5px", lineHeight: 1.65, marginBottom: "16px" }}>
                            The grand finale where teams use Tech Coins earned in Round 4 to bid for their shortlisted Tech Challenge. If outbid on their first choice, they can bid on their backup shortlisted challenge.
                        </p>

                        <div style={{ marginBottom: "20px" }}>
                            <h3 style={{ fontSize: "16px", color: "var(--primary)", fontWeight: "700", marginBottom: "6px" }}>
                                💡 Challenge Justification & Defense
                            </h3>
                            <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
                                After winning the bid, teams present before evaluators to justify why their owned Technology Cards are suitable and relevant to solve the chosen challenge.
                            </p>
                        </div>

                        <div style={{ background: "rgba(255, 255, 255, 0.02)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                            <strong style={{ color: "#fff", fontSize: "14.5px", display: "block", marginBottom: "12px" }}>
                                🏆 Scoring Rubric (Card Match & Justification):
                            </strong>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", textAlign: "center" }}>
                                <div style={{ padding: "14px 10px", background: "rgba(0, 240, 255, 0.06)", borderRadius: "10px", border: "1px solid rgba(0, 240, 255, 0.25)" }}>
                                    <div style={{ color: "var(--primary)", fontWeight: "800", fontSize: "15px", marginBottom: "2px" }}>3/3 Cards Matched</div>
                                    <div style={{ fontSize: "18px", color: "#fff", fontWeight: "900", fontFamily: "var(--font-mono)" }}>100 Points</div>
                                    <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px" }}>Maximum Points</div>
                                </div>
                                <div style={{ padding: "14px 10px", background: "rgba(255, 215, 0, 0.06)", borderRadius: "10px", border: "1px solid rgba(255, 215, 0, 0.25)" }}>
                                    <div style={{ color: "var(--accent-gold)", fontWeight: "800", fontSize: "15px", marginBottom: "2px" }}>2/3 Cards Matched</div>
                                    <div style={{ fontSize: "18px", color: "#fff", fontWeight: "900", fontFamily: "var(--font-mono)" }}>65 Points</div>
                                    <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px" }}>Partial Points</div>
                                </div>
                                <div style={{ padding: "14px 10px", background: "rgba(192, 132, 252, 0.06)", borderRadius: "10px", border: "1px solid rgba(192, 132, 252, 0.25)" }}>
                                    <div style={{ color: "#c084fc", fontWeight: "800", fontSize: "15px", marginBottom: "2px" }}>1/3 Card Matched</div>
                                    <div style={{ fontSize: "18px", color: "#fff", fontWeight: "900", fontFamily: "var(--font-mono)" }}>30 Points</div>
                                    <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px" }}>Minimum Points</div>
                                </div>
                                <div style={{ padding: "14px 10px", background: "rgba(244, 63, 94, 0.06)", borderRadius: "10px", border: "1px solid rgba(244, 63, 94, 0.25)" }}>
                                    <div style={{ color: "#fb7185", fontWeight: "800", fontSize: "15px", marginBottom: "2px" }}>0/3 Cards Matched</div>
                                    <div style={{ fontSize: "18px", color: "#fff", fontWeight: "900", fontFamily: "var(--font-mono)" }}>0 Points</div>
                                    <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "2px" }}>No Points</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FINAL SCOREBOARD CALCULATION (Unified Formula) */}
                    <div className="glass-card" style={{ padding: "34px", border: "1px solid rgba(255, 215, 0, 0.35)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                            <span style={{ fontSize: "28px" }}>🏆</span>
                            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--accent-gold)", margin: 0 }}>
                                Final Scoreboard & Ranking Calculation
                            </h2>
                        </div>

                        {/* Single Unified Formula Banner */}
                        <div style={{
                            background: "rgba(255, 215, 0, 0.08)",
                            border: "1px solid rgba(255, 215, 0, 0.35)",
                            borderRadius: "14px",
                            padding: "20px 24px",
                            marginBottom: "24px",
                            textAlign: "center",
                        }}>
                            <div style={{ fontSize: "20px", color: "var(--accent-gold)", fontWeight: "800", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
                                ⭐ FINAL SCORE FORMULA ⭐
                            </div>
                            <div style={{
                                fontSize: "clamp(15px, 2.2vw, 20px)",
                                fontWeight: "900",
                                color: "#ffffff",
                                fontFamily: "var(--font-mono)",
                                lineHeight: 1.5,
                            }}>
                                <span style={{ color: "var(--primary)" }}>Remaining Tech Coins (R5)</span>
                                {" + "}
                                <span style={{ color: "var(--accent-gold)" }}>Tech Cards Market Value</span>
                                {" + "}
                                <span style={{ color: "#34d399" }}>Justification & Match Score</span>
                            </div>
                        </div>

                        {/* 3 Component Breakdown */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                            gap: "16px",
                        }}>
                            <div style={{ padding: "18px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                <div style={{ color: "var(--primary)", fontWeight: "800", fontSize: "15px", marginBottom: "6px" }}>
                                    🪙 1. Remaining Tech Coins
                                </div>
                                <p style={{ fontSize: "13.5px", color: "var(--text-dim)", lineHeight: 1.55, margin: 0 }}>
                                    Total unused Tech Coins held by the participant team at the end of Round 5.
                                </p>
                            </div>

                            <div style={{ padding: "18px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                <div style={{ color: "var(--accent-gold)", fontWeight: "800", fontSize: "15px", marginBottom: "6px" }}>
                                    🎴 2. Cards Market Value
                                </div>
                                <p style={{ fontSize: "13.5px", color: "var(--text-dim)", lineHeight: 1.55, margin: 0 }}>
                                    The final dynamic market valuation of all Technology Cards possessed by the team.
                                </p>
                            </div>

                            <div style={{ padding: "18px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                                <div style={{ color: "#34d399", fontWeight: "800", fontSize: "15px", marginBottom: "6px" }}>
                                    🎯 3. Justification & Match Score
                                </div>
                                <p style={{ fontSize: "13.5px", color: "var(--text-dim)", lineHeight: 1.55, margin: 0 }}>
                                    Points awarded for matching cards: <strong>100</strong> (3/3), <strong>65</strong> (2/3), <strong>30</strong> (1/3), <strong>0</strong> (0/3).
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default EventInfo;
