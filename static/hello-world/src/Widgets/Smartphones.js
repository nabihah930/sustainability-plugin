import Lottie from "lottie-react";
import animationData from "../lottie/AnimationSmartphones.json"
import styles from "../Styles/View.styles.js";

function SmartphonesWidget() {
    return (
        <div style={styles.animationContainer}>
            <Lottie animationData={animationData} loop={true} style={{ width: 80, height: 80 }} />
        </div>
    );
}

export default SmartphonesWidget;
