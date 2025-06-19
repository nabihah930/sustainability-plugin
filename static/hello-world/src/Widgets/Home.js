import Lottie from "lottie-react";
import animationData from "../lottie/AnimationHome.json"
import styles from "../Styles/Equivalencies.styles";

function HomeWidget() {
    return (
        <div style={styles.animationContainer}>
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
}

export default HomeWidget;
