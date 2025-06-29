import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const amount = searchParams.get("amount") || "1";
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 60,
                    color: "black",
                    background: "white",
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
                <div style={{ fontSize: 80, marginBottom: 30 }}>💸</div>
                <div style={{ fontWeight: "bold", marginBottom: 20 }}>{`I've given $${amount}`}</div>
                <div style={{ fontSize: 36 }}>You should too!</div>
                <div style={{ fontSize: 24, marginTop: 40, color: "#888" }}>gimme.jrbussard.com</div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    );
}
