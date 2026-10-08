import { AbsoluteFill, Composition, interpolate, staticFile, useCurrentFrame } from "remotion";

const MavernIntro = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 25, 130, 160], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, 45], [0.9, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#f7f6f2", alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity, transform: `scale(${scale})`, textAlign: "center", color: "#253d30" }}>
        <img src={staticFile("assets/mavern-logo.png")} style={{ width: 260, height: 260, borderRadius: "50%" }} />
        <div style={{ marginTop: 28, fontFamily: "Inter, sans-serif", fontSize: 62, letterSpacing: -4, fontWeight: 500 }}>mavern</div>
      </div>
    </AbsoluteFill>
  );
};

export const RemotionRoot = () => (
  <Composition id="MavernIntro" component={MavernIntro} durationInFrames={180} fps={30} width={1080} height={1080} />
);
