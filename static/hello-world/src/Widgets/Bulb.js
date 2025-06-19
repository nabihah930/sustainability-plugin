import Lottie from "lottie-react";
import animationData from "../lottie/AnimationBulb.json"
import styles from "../Styles/Equivalencies.styles";

function BulbWidget() {
    return (
        <div style={styles.animationContainer}>
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
}

export default BulbWidget;
