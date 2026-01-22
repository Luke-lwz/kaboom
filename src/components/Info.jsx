import { AiOutlineInfoCircle } from "react-icons/ai"

function Info({ tooltip = "", bottom, href }) {
    return (
        <a href={href} target="_blank" className={"tooltip before:overflow-hidden text-info drop-shadow opacity-100 font-bold normal-case  " + (bottom ? " tooltip-bottom " : "  ")} data-tip={tooltip}>
            <AiOutlineInfoCircle />
        </a>
    );
}

export default Info;