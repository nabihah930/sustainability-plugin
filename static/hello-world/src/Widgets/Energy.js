import { useEffect, useRef } from "react";
import Lottie from "lottie-react";
import animationData from "../lottie/AnimationBattery.json";
import { MAX_JOULES } from "../util/constants";

function EnergyWidget({ totalEnergyJoules, styles }) {
    const lottieRef = useRef();
    const maxFrame = 420;

    useEffect(() => {
        if (lottieRef.current) {
            const clampedJoules = Math.min(totalEnergyJoules || 0, MAX_JOULES);
            const targetFrame = Math.floor((clampedJoules / MAX_JOULES) * maxFrame);
            lottieRef.current.playSegments([0, targetFrame], true);
        }
    }, [totalEnergyJoules]);

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

export default EnergyWidget;
