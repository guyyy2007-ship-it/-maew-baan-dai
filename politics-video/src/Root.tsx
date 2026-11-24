import { Composition } from "remotion";
import { FPS, TOTAL_FRAMES } from "./data";
import { Presentation } from "./Presentation";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="PoliticsPresentation"
      component={Presentation}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
      // Put your AI voice file in public/ and write its name here, e.g. "voice.mp3"
      defaultProps={{ voiceover: "", characterMode: "video" as const }}
    />
  );
};
