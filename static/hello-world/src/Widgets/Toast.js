import Lottie from "lottie-react";
import animationData from "../lottie/AnimationToast.json"

function ToastWidget() {
    return (
        <div style={{ width: 200, height: 200 }}>
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
}

export default ToastWidget;
