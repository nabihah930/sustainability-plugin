import Lottie from "lottie-react";
import animationData from "../lottie/AnimationToast.json"
import styles from "../Styles/Equivalencies.styles";

function ToastWidget() {
    return (
        <div style={styles.animationContainer}>
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
}

export default ToastWidget;
