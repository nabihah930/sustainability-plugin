import Lottie from "lottie-react";
import animationData from "../lottie/AnimationSustainability.json"
import styles from "../Styles/Equivalencies.styles";

function SustainabilityWidget() {
    return (
        <div style={styles.animationContainer}>
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
}

export default SustainabilityWidget;
