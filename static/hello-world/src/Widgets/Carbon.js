import Lottie from "lottie-react";
import animationData from "../lottie/AnimationMeter.json";

const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

function CarbonWidget() {
    return (
        <div style={{ width: 200, height: 200 }}>
            <Lottie
                options={defaultOptions}
                height={400}
                width={400}
            />
        </div>
    );
}

export default CarbonWidget;
