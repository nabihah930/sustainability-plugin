import Lottie from "lottie-react";
import animationData from "../lottie/AnimationSustainability.json"
import styles from "../Styles/View.styles.js";

function SustainabilityWidget() {
    return (
        <div style={styles.animationContainer}>
            <Lottie animationData={animationData} loop={true} style={{ width: 80, height: 80 }} />
        </div>
    );
}

export default SustainabilityWidget;
