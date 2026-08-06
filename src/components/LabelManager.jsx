import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { LABEL_CONFIG, runLabelPass } from "../utilities/labelManager";

function LabelManager({
  fadeStart = LABEL_CONFIG.fadeStart,
  fadeEnd = LABEL_CONFIG.fadeEnd,
  intervalMs = LABEL_CONFIG.passIntervalMs,
}) {
  const { camera, gl, size } = useThree();
  const lastPass = useRef(0);

  useFrame(() => {
    const now = performance.now();
    if (now - lastPass.current < intervalMs) return;
    lastPass.current = now;
    runLabelPass(camera, gl, size, { fadeStart, fadeEnd });
  });

  return null;
}

export default LabelManager;
