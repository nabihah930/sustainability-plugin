import Lottie from "lottie-react";
import animationData from "../lottie/AnimationCar.json"
import styles from "../Styles/Equivalencies.styles";

function CarWidget() {
    return (
        <div style={styles.animationContainer}>
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
}

export default CarWidget;
