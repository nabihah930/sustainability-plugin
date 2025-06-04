import Lottie from "lottie-react";
import animationData from "../lottie/AnimationSmartphones.json"

function SmartphonesWidget() {
    return (
        <div style={{ width: 200, height: 200 }}>
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
}

export default SmartphonesWidget;
