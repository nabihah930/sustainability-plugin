import Lottie from "lottie-react";
import animationData from "../lottie/AnimationTree.json";

function TreeWidget({ styles }) {
    return (
        <div style={styles.widget}>
            <Lottie animationData={animationData} loop={true} />
        </div>
    );
}

export default TreeWidget;
