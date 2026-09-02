import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function LandingPage() {
    const { user, isAdmin } = useAuth();

    const INSTAGRAM_URL = "https://www.instagram.com/ieee_vts_vitc?igsi=MXFoNGV3ejU4bTE0MA==";
    const LINKEDIN_URL = "https://www.linkedin.com/in/ieee-vts-chapter-vit-chennai-75a049431/";

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar />

            {/* Grand Hero Section */}
            <section style={{
                position: "relative",
                padding: "90px 24px 80px",
                textAlign: "center",
                overflow: "hidden",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <div style={{ maxWidth: "920px", margin: "0 auto", position: "relative", zIndex: 2 }}>

                    {/* Organization Banner */}
                    <div style={{
                        display: "inline-block",
                        marginBottom: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.18em",
                        fontSize: "13px",
                        fontWeight: "800",
                        color: "var(--primary)",
                    }}>
                        IEEE VEHICULAR TECHNOLOGY SOCIETY PRESENTS
                    </div>

                    {/* Official Event Title */}
                    <h1 style={{
                        fontSize: "clamp(56px, 11vw, 108px)",
                        lineHeight: 1,
                        marginBottom: "14px",
                        fontWeight: "900",
                        letterSpacing: "-0.035em",
                    }}>
                        <span className="gradient-text-cyan">TECH BID</span>
                    </h1>

                    {/* Subtitle & Chapter Info */}
                    <div style={{
                        fontSize: "15px",
                        fontWeight: "700",
                        color: "var(--accent-gold)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        marginBottom: "24px",
                    }}>
                        technoVIT • IEEE VTS Student Chapter VIT Chennai
                    </div>

                    <p style={{
                        fontSize: "clamp(16px, 2vw, 19px)",
                        color: "#cbd5e1",
                        maxWidth: "740px",
                        margin: "0 auto 38px",
                        lineHeight: 1.65,
                    }}>
                        A 5-round technical battle combining speed, problem solving, Tech Coins, technology auctions, and strategy to crown the ultimate Tech Bid champion.
                    </p>

                    {/* Action CTAs */}
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap", marginBottom: "36px" }}>
                        {user ? (
                            <>
                                <Link
                                    to={isAdmin ? "/admin" : "/dashboard"}
                                    className="btn-primary"
                                    style={{ padding: "16px 36px", fontSize: "16px" }}
                                >
                                    {isAdmin ? "Go to Admin Console →" : "Open Team Dashboard →"}
                                </Link>
                                <Link
                                    to="/leaderboard"
                                    className="btn-gold"
                                    style={{ padding: "16px 32px", fontSize: "16px" }}
                                >
                                    🏆 Live Standings
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/register"
                                    className="btn-primary"
                                    style={{ padding: "16px 36px", fontSize: "16px" }}
                                >
                                    Register Your Team →
                                </Link>
                                <Link
                                    to="/login"
                                    className="btn-secondary"
                                    style={{ padding: "16px 32px", fontSize: "16px" }}
                                >
                                    Team Login
                                </Link>
                                <Link
                                    to="/event-info"
                                    className="btn-secondary"
                                    style={{ padding: "16px 32px", fontSize: "16px" }}
                                >
                                    📖 Event Guide
                                </Link>
                            </>
                        )}
                    </div>

                </div>
            </section>

            {/* Footer */}
            <footer style={{
                marginTop: "auto",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "36px 24px",
                textAlign: "center",
                color: "var(--text-dim)",
                fontSize: "13px",
                background: "rgba(3, 7, 18, 0.85)",
            }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>

                    {/* Chapter & Logo Info */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "8px",
                            background: "#fff",
                            padding: "2px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                        }}>
                            <img src="/vts-logo.png" alt="IEEE VTS" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        </div>
                        <div style={{ textAlign: "left" }}>
                            <div style={{ color: "#fff", fontWeight: "700" }}>IEEE VTS Student Chapter VIT Chennai</div>
                            <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>TechnoVIT '26 Event</div>
                        </div>
                    </div>

                    {/* Social Quick Links in Footer */}
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <a
                            href={INSTAGRAM_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Follow on Instagram"
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                background: "rgba(225, 48, 108, 0.1)",
                                border: "1px solid rgba(225, 48, 108, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#f472b6",
                                textDecoration: "none",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </a>

                        <a
                            href={LINKEDIN_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Connect on LinkedIn"
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "50%",
                                background: "rgba(10, 102, 194, 0.1)",
                                border: "1px solid rgba(10, 102, 194, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#38bdf8",
                                textDecoration: "none",
                                transition: "all 0.2s ease",
                            }}
                        >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                        </a>
                    </div>

                    <div>
                        © 2026 Tech Bid • TechnoVIT. All Competition Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
