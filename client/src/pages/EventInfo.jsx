import Navbar from "../components/Navbar";

function EventInfo() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            <div style={{ maxWidth: "1100px", margin: "40px auto 80px", padding: "0 24px", width: "100%" }}>
                
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "48px" }}>
                    <span className="badge badge-cyan" style={{ marginBottom: "12px" }}>
                        COMPREHENSIVE EVENT GUIDE
                    </span>
                    <h1 style={{ fontSize: "40px", marginBottom: "12px" }}>
                        IEEE VTS Tech Bid Event 2026
                    </h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "16px", maxWidth: "720px", margin: "0 auto", lineHeight: 1.6 }}>
                        Detailed guidelines, game mechanics, timing restrictions, and scoring rubrics for all 5 stages of the competition.
                    </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

                    {/* Tech Coins & Economy Overview */}
                    <div className="glass-card" style={{ padding: "36px", border: "1px solid rgba(255, 215, 0, 0.3)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                            <span style={{ fontSize: "28px" }}>🪙</span>
                            <h2 style={{ fontSize: "24px", color: "var(--accent-gold)" }}>
                                Tech Coin Economy & Scoring System
                            </h2>
                        </div>
                        <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.7, marginBottom: "16px" }}>
                            Tech Coins are the primary currency and scoring foundation of the event. Teams earn Tech Coins in speed rounds, spend them during high-stakes auctions, and convert final asset portfolios into competition points.
                        </p>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "16px",
                            background: "rgba(255, 255, 255, 0.02)",
                            padding: "20px",
                            borderRadius: "14px",
                        }}>
                            <div>
                                <strong style={{ color: "var(--primary)", display: "block" }}>Earn Coins</strong>
                                <span style={{ fontSize: "13px", color: "var(--text-dim)" }}>
                                    Speed Quiz, Code Debugging, Image Terms, Jumbled Words, Resistors
                                </span>
                            </div>
                            <div>
                                <strong style={{ color: "var(--accent-gold)", display: "block" }}>Spend in Auctions</strong>
                                <span style={{ fontSize: "13px", color: "var(--text-dim)" }}>
                                    Round 2 Tech Cards Auction & Round 5 Problem Statement Auction
                                </span>
                            </div>
                            <div>
                                <strong style={{ color: "#c084fc", display: "block" }}>Final Score Formula</strong>
                                <span style={{ fontSize: "13px", color: "var(--text-dim)" }}>
                                    Remaining Coins + Possessed Tech Card Values + Final Defense Score
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ROUND 1 */}
                    <div className="glass-card" style={{ padding: "36px" }}>
                        <span className="badge badge-cyan" style={{ marginBottom: "10px" }}>STAGE 1</span>
                        <h2 style={{ fontSize: "24px", marginBottom: "12px" }}>
                            Round 1: Tri-Game Challenge
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            <div style={{ padding: "16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "10px" }}>
                                <strong style={{ color: "#fff", fontSize: "16px" }}>Game 1: Technical Speed Quiz</strong>
                                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                                    15 questions • 10 seconds per question. Immediate answer submission with auto-advancement. 20 Tech Coins per correct answer (Maximum 300 Tech Coins). Protected with an Admin-controlled PIN.
                                </p>
                            </div>
                            <div style={{ padding: "16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "10px" }}>
                                <strong style={{ color: "#fff", fontSize: "16px" }}>Game 2: Image / Technical Term Identification</strong>
                                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                                    3 unique sets to prevent copying. 4 images per set. Evaluators manually award points based on word count: 1 word = 100 Coins, 2 words = 75 Coins, 3 words = 50 Coins, 4 words = 25 Coins.
                                </p>
                            </div>
                            <div style={{ padding: "16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "10px" }}>
                                <strong style={{ color: "#fff", fontSize: "16px" }}>Game 3: Code Output & Debugging</strong>
                                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                                    Rapid online programming questions testing syntax evaluation, output prediction, and algorithmic debugging under the 10-second timer.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ROUND 2 */}
                    <div className="glass-card" style={{ padding: "36px" }}>
                        <span className="badge badge-gold" style={{ marginBottom: "10px" }}>STAGE 2</span>
                        <h2 style={{ fontSize: "24px", marginBottom: "12px" }}>
                            Round 2: Tech Card Live Auction
                        </h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.7 }}>
                            Admins conduct a live physical auction where teams utilize earned Tech Coins to bid on hardware & software component cards (e.g. LiDAR, Vision Processors, BMS, GPS Modules). Admins update the official system with winning cards and their final market values, which contribute directly to the team's total valuation.
                        </p>
                    </div>

                    {/* ROUND 3 */}
                    <div className="glass-card" style={{ padding: "36px" }}>
                        <span className="badge badge-purple" style={{ marginBottom: "10px" }}>STAGE 3</span>
                        <h2 style={{ fontSize: "24px", marginBottom: "12px" }}>
                            Round 3: Problem Statement Matching & Strategy
                        </h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.7 }}>
                            Problem statements are broadcast exclusively on the main venue projector. Teams analyze the requirements and strategically assess how their acquired Tech Cards match the available challenges (1-card match, 2-card match, 3-card full match) in preparation for the final auction.
                        </p>
                    </div>

                    {/* ROUND 4 */}
                    <div className="glass-card" style={{ padding: "36px" }}>
                        <span className="badge badge-cyan" style={{ marginBottom: "10px" }}>STAGE 4</span>
                        <h2 style={{ fontSize: "24px", marginBottom: "12px" }}>
                            Round 4: Dual Technical Arena
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            <div style={{ padding: "16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "10px" }}>
                                <strong style={{ color: "#fff", fontSize: "16px" }}>Game 1: Jumbled Technical Words</strong>
                                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                                    Online unscrambling game under 10-second timer per question (Maximum 500 Tech Coins).
                                </p>
                            </div>
                            <div style={{ padding: "16px", background: "rgba(255, 255, 255, 0.02)", borderRadius: "10px" }}>
                                <strong style={{ color: "#fff", fontSize: "16px" }}>Game 2: Resistance Challenge</strong>
                                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginTop: "4px" }}>
                                    Physical challenge using real resistors and color-code sheets. Evaluators score each of the 4 questions directly on the judging terminal (Maximum 300 Tech Coins).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ROUND 5 */}
                    <div className="glass-card" style={{ padding: "36px", border: "1px solid rgba(0, 240, 255, 0.3)" }}>
                        <span className="badge badge-gold" style={{ marginBottom: "10px" }}>STAGE 5</span>
                        <h2 style={{ fontSize: "24px", marginBottom: "12px" }}>
                            Round 5: Grand Auction & Physical Architecture Defense
                        </h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.7, marginBottom: "14px" }}>
                            Teams spend remaining Tech Coins in the final auction to claim their desired Problem Statement. Once secured, roving evaluators judge how comprehensively the team's possessed Tech Cards solve the problem:
                        </p>
                        <ul style={{ color: "var(--text-muted)", paddingLeft: "20px", fontSize: "14px", lineHeight: 1.8 }}>
                            <li><strong style={{ color: "var(--accent-gold)" }}>3/3 Cards Matched:</strong> 100 Tech Coins</li>
                            <li><strong style={{ color: "var(--accent-gold)" }}>2/3 Cards Matched:</strong> 50 Tech Coins</li>
                            <li><strong style={{ color: "var(--accent-gold)" }}>1/3 Cards Matched:</strong> 25 Tech Coins</li>
                            <li><strong style={{ color: "var(--accent-gold)" }}>0 Cards Matched:</strong> 0 Tech Coins</li>
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default EventInfo;
