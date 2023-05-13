import {AiOutlineInfoCircle} from "react-icons/ai"

function Info({ tooltip = "", bottom }) {
    return (
        <div className={"tooltip text-info drop-shadow opacity-100 font-bold normal-case " + (bottom ? " tooltip-bottom ": "  ")} data-tip={tooltip}>
            <AiOutlineInfoCircle />
        </div>
    );
}

export default Info;