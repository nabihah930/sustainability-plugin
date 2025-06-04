import Lottie from "lottie-react";
import animationData from "../lottie/AnimationCar.json"

function CarWidget() {
    return (
        <div style={{ width: 200, height: 200 }}>
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
}

export default CarWidget;
