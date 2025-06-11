import Lottie from "lottie-react";
import animationData from "../lottie/AnimationBigTree.json"

function BigTreeWidget({ styles }) {
    return (
        <div style={styles.widget}>
            <Lottie animationData={animationData} loop={false} />
        </div>
    );
}

export default BigTreeWidget;
