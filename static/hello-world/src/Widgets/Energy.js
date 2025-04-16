import Lottie from "lottie-react";
import animationData from "../lottie/AnimationBattery.json";

function EnergyWidget() {
    return (
        <div style={{ width: 200, height: 200 }}>
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
}

export default EnergyWidget;
