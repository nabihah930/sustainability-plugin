import Lottie from "lottie-react";
import animationData from "../lottie/AnimationSmartphones.json"
import styles from "../Styles/Equivalencies.styles";

function SmartphonesWidget() {
    return (
        <div style={styles.animationContainer}>
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
}

export default SmartphonesWidget;
