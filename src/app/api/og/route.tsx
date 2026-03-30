import { ImageResponse } from "next/og";

export const runtime = "edge";

// Hat emoji mapping
const hatEmojis: Record<string, string> = {
    "fun-hat": "🎩",
    "party-hat": "🥳",
    "crown": "👑",
    "wizard": "🧙",
    "cap": "🧢",
    "cowboy": "🤠",
    "beanie": "🧶",
    "helmet": "⛑️",
    "beret": "🎨",
    "santa": "🎅",
    "top-hat": "🎩",
    "graduation-cap": "🎓",
    "flower-crown": "🌸",
};

// Accessory emoji mapping
const accessoryEmojis: Record<string, string> = {
    "sunglasses": "🕶️",
    "mask": "😷",
    "halo": "😇",
    "wings": "👼",
    "devil": "😈",
    "robot": "🤖",
    "alien": "👽",
    "headphones": "🎧",
    "monocle": "🧐",
    "microphone": "🎤",
};

// Effect configurations for visual representation
const effectConfigs: Record<string, { emoji: string; color: string; glowColor: string }> = {
    "sparkles": { emoji: "✨", color: "#ffd700", glowColor: "rgba(255,215,0,0.4)" },
    "glow": { emoji: "💫", color: "#ffffff", glowColor: "rgba(255,255,255,0.5)" },
    "glow-effect": { emoji: "💫", color: "#ffffff", glowColor: "rgba(255,255,255,0.5)" },
    "rainbow": { emoji: "🌈", color: "#ff0000", glowColor: "rgba(255,0,255,0.3)" },
    "rainbow-effect": { emoji: "🌈", color: "#ff0000", glowColor: "rgba(255,0,255,0.3)" },
    "fire": { emoji: "🔥", color: "#ff6b35", glowColor: "rgba(255,107,53,0.5)" },
    "fire-effect": { emoji: "🔥", color: "#ff6b35", glowColor: "rgba(255,107,53,0.5)" },
    "ice": { emoji: "❄️", color: "#a8dadc", glowColor: "rgba(168,218,220,0.5)" },
    "ice-effect": { emoji: "❄️", color: "#a8dadc", glowColor: "rgba(168,218,220,0.5)" },
    "lightning": { emoji: "⚡", color: "#00d4ff", glowColor: "rgba(0,212,255,0.5)" },
    "lightning-effect": { emoji: "⚡", color: "#00d4ff", glowColor: "rgba(0,212,255,0.5)" },
    "stars": { emoji: "⭐", color: "#ffd700", glowColor: "rgba(255,215,0,0.4)" },
    "stars-effect": { emoji: "⭐", color: "#ffd700", glowColor: "rgba(255,215,0,0.4)" },
    "petals": { emoji: "🌸", color: "#f4acb7", glowColor: "rgba(244,172,183,0.45)" },
    "petals-effect": { emoji: "🌸", color: "#f4acb7", glowColor: "rgba(244,172,183,0.45)" },
    "hearts": { emoji: "💖", color: "#ff4d6d", glowColor: "rgba(255,77,109,0.45)" },
    "hearts-effect": { emoji: "💖", color: "#ff4d6d", glowColor: "rgba(255,77,109,0.45)" },
    "comet": { emoji: "☄️", color: "#ffd166", glowColor: "rgba(255,209,102,0.45)" },
    "comet-effect": { emoji: "☄️", color: "#ffd166", glowColor: "rgba(255,209,102,0.45)" },
};

// Get badge style based on click count
function getBadgeStyle(clicks: number) {
    if (clicks >= 100) {
        return {
            bg: "linear-gradient(135deg, #ffd700, #ff8c00)",
            color: "#1a1a1a",
            border: "rgba(255,215,0,0.8)",
            label: "🏆 Gold Clicker",
        };
    } else if (clicks >= 50) {
        return {
            bg: "linear-gradient(135deg, #c0c0c0, #808080)",
            color: "#1a1a1a",
            border: "rgba(192,192,192,0.8)",
            label: "🥈 Silver Clicker",
        };
    } else if (clicks >= 20) {
        return {
            bg: "linear-gradient(135deg, #cd7f32, #8b4513)",
            color: "#fff",
            border: "rgba(205,127,50,0.8)",
            label: "🥉 Bronze Clicker",
        };
    }
    return {
        bg: "linear-gradient(135deg, #667eea, #764ba2)",
        color: "#fff",
        border: "rgba(102,126,234,0.8)",
        label: "✨ Clicker",
    };
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    
    // Get parameters
    const clicks = parseInt(searchParams.get("clicks") || "0", 10);
    const name = searchParams.get("name") || "A Clicker";
    const hat = searchParams.get("hat") || "";
    const accessory = searchParams.get("accessory") || "";
    const effect = searchParams.get("effect") || "";
    const color = searchParams.get("color") || "#667eea";
    const avatar = searchParams.get("avatar") || "";
    
    // Legacy support for amount parameter
    const amount = searchParams.get("amount");
    if (amount && !searchParams.get("clicks")) {
        // Old format - just show simple message
        return new ImageResponse(
            (
                <div
                    style={{
                        fontSize: 60,
                        color: "white",
                        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "50px 100px",
                        textAlign: "center",
                    }}
                >
                    <div style={{ fontSize: 100, marginBottom: 30 }}>🖱️</div>
                    <div style={{ fontWeight: "bold", marginBottom: 20 }}>{`I've clicked ${amount} times!`}</div>
                    <div style={{ fontSize: 36 }}>Join the competition!</div>
                    <div style={{ fontSize: 24, marginTop: 40, color: "#888" }}>clicker.jrbussard.com</div>
                </div>
            ),
            { width: 1200, height: 630 }
        );
    }

    const badge = getBadgeStyle(clicks);
    const hatEmoji = hat ? hatEmojis[hat] : "";
    const accessoryEmoji = accessory ? accessoryEmojis[accessory] : "";
    const effectConfig = effect ? effectConfigs[effect] : null;
    const isFaceAccessory = accessory === "sunglasses" || accessory === "mask" || accessory === "monocle";
    const isHeadAccessory = accessory === "headphones";

    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Background decorations */}
                <div
                    style={{
                        position: "absolute",
                        top: -100,
                        right: -100,
                        width: 400,
                        height: 400,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 70%)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: -150,
                        left: -150,
                        width: 500,
                        height: 500,
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(118,75,162,0.2) 0%, transparent 70%)",
                    }}
                />

                {/* Main content */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 24,
                        zIndex: 10,
                    }}
                >
                    {/* Avatar section */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                        }}
                    >
                        {/* Effect glow behind avatar */}
                        {effectConfig && (
                            <div
                                style={{
                                    position: "absolute",
                                    width: 200,
                                    height: 200,
                                    borderRadius: "50%",
                                    background: `radial-gradient(circle, ${effectConfig.glowColor} 0%, transparent 70%)`,
                                    zIndex: 1,
                                }}
                            />
                        )}
                        
                        {/* Hat emoji above avatar */}
                        {hatEmoji && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: -50,
                                    left: "50%",
                                    transform: "translateX(-50%) rotate(-10deg)",
                                    fontSize: 70,
                                    zIndex: 20,
                                }}
                            >
                                {hatEmoji}
                            </div>
                        )}
                        
                        {/* Accessory emoji */}
                        {accessoryEmoji && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: isFaceAccessory ? 25 : isHeadAccessory ? 8 : 5,
                                    right: isFaceAccessory ? -10 : isHeadAccessory ? -18 : -40,
                                    fontSize: 50,
                                    zIndex: 20,
                                }}
                            >
                                {accessoryEmoji}
                            </div>
                        )}
                        
                        {/* Effect emoji */}
                        {effectConfig && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: -20,
                                    right: -30,
                                    fontSize: 45,
                                    zIndex: 25,
                                    filter: `drop-shadow(0 0 10px ${effectConfig.color})`,
                                }}
                            >
                                {effectConfig.emoji}
                            </div>
                        )}
                        
                        {/* Cursor dot with glow */}
                        <div
                            style={{
                                width: 140,
                                height: 140,
                                borderRadius: "50%",
                                background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                                zIndex: 10,
                            }}
                        >
                            <div
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: "50%",
                                    background: color,
                                    border: "6px solid rgba(255,255,255,0.9)",
                                    boxShadow: `0 8px 32px ${color}60`,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {avatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={avatar}
                                        alt=""
                                        width={88}
                                        height={88}
                                        style={{
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    <div style={{ fontSize: 50 }}>🖱️</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div
                        style={{
                            fontSize: 52,
                            fontWeight: "bold",
                            color: "white",
                            textShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        }}
                    >
                        {name}
                    </div>

                    {/* Click count */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 16,
                        }}
                    >
                        <div
                            style={{
                                background: badge.bg,
                                color: badge.color,
                                border: `3px solid ${badge.border}`,
                                borderRadius: 20,
                                padding: "12px 32px",
                                fontSize: 36,
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                            }}
                        >
                            <span>{clicks.toLocaleString()}</span>
                            <span style={{ fontSize: 28 }}>clicks</span>
                        </div>
                    </div>

                    {/* Badge label */}
                    <div
                        style={{
                            fontSize: 28,
                            color: "rgba(255,255,255,0.7)",
                            marginTop: 8,
                        }}
                    >
                        {badge.label}
                    </div>

                    {/* CTA */}
                    <div
                        style={{
                            marginTop: 32,
                            background: "linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)",
                            borderRadius: 16,
                            padding: "16px 40px",
                            fontSize: 28,
                            fontWeight: "bold",
                            color: "#1a1a2e",
                            boxShadow: "0 4px 20px rgba(255,107,107,0.4)",
                        }}
                    >
                        🎯 Join me on Clicker!
                    </div>
                </div>

                {/* Footer */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 30,
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 22,
                    }}
                >
                    clicker.jrbussard.com
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
}
