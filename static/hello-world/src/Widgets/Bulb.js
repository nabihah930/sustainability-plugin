import Lottie from "lottie-react";
import animationData from "../lottie/AnimationBulb.json"

function BulbWidget() {
    return (
        <div style={{ width: 200, height: 200 }}>
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
}

export default BulbWidget;
