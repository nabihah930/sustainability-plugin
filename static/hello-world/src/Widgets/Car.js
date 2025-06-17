import Lottie from "lottie-react";
import animationData from "../lottie/AnimationCar.json"
import styles from "../Styles/View.styles.js";

function CarWidget() {
    return (
        <div style={styles.animationContainer}>
            <Lottie animationData={animationData} loop={true} style={{ width: 90, height: 90 }} />
        </div>
    );
}

export default CarWidget;
