import React, { Suspense, useMemo } from "react";

interface AnimationOverlayProps {
  animationUrl: string;
  onAnimationComplete?: () => void;
}

const LazyLottie = React.lazy(async () => {
  try {
    const mod: any = await import(/* @vite-ignore */ '@lottiefiles/dotlottie-react');
    return { default: mod.DotLottieReact };
  } catch (e) {
    return { default: () => null } as any;
  }
});

export default function AnimationOverlay({ animationUrl, onAnimationComplete }: AnimationOverlayProps) {
  const content = useMemo(() => (
    <Suspense fallback={null}>
      <LazyLottie src={animationUrl} loop={false} autoplay onComplete={onAnimationComplete} />
    </Suspense>
  ), [animationUrl, onAnimationComplete]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-500" style={{ pointerEvents: 'none' }}>
      <div className="w-1/2 max-w-sm">
        {content}
      </div>
    </div>
  );
}
