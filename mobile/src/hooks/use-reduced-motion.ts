import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** Lê a preferência de redução de movimento do sistema. */
export function useReducedMotion(): boolean {
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setIsReduced);
    const assinatura = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setIsReduced
    );
    return () => assinatura.remove();
  }, []);

  return isReduced;
}
