import Lottie from "lottie-react";
import { useEffect, useRef } from "react";
import animationData from "../lottie/AnimationMeter.json";

function MeterWidget({ totalCPUpercent, styles }) {
    const lottieRef = useRef();
    const maxFrame = 136;

    useEffect(() => {
        if (lottieRef.current) {
            const clampedUtilization = Math.min(totalCPUpercent || 0, 100);
            const targetFrame = Math.floor((clampedUtilization / 100) * maxFrame);
            lottieRef.current.setSpeed(0.5);
            lottieRef.current.playSegments([0, targetFrame], true);
        }
    }, [totalCPUpercent]);
    
    return (
        <div style={styles.widget}>
            <Lottie
                lottieRef={lottieRef}
                animationData={animationData}
                loop={false}
                autoplay={false}
            />
        </div>
    );
}

export default MeterWidget;
