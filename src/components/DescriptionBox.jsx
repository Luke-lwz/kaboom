import { useEffect, useMemo, useRef, useState } from "preact/hooks";

function DescriptionBox({ description, prefixText }) {
    const [more, setMore] = useState(false);
    const [ showMore, setShowMore ] = useState(false);
    const ellipsisRef = useRef(null);


    useEffect(() => {
        if (description && description.length > 0) {
            setTimeout(() => {
                setShowMore(hasEllipsis(ellipsisRef.current));
            }, 500)
        }
    }, []);


    useMemo(() => {
        if (description && description.length > 0 && hasEllipsis(ellipsisRef.current)) {
            setShowMore(true);
        } else {
            setShowMore(false);
        }
    }, [description, ellipsisRef.current]);

    function hasEllipsis(element) {
        console.log(element)
        if (!element) return false;
        return element.offsetHeight < element.scrollHeight ||
            element.offsetWidth < element.scrollWidth;;
    }

    return (description && description.length > 0) && (
        <div className="w-full flex flex-wrap text-sm" onClick={() => setMore(m => !m)}>
            <div className={"mr-1 " + (more ? "  " : " two-line-ellipsis ")} ref={ellipsisRef}>
                <span className="font-bold">{`${prefixText || "Description"}: `}</span>
                {description}

            </div>
            {showMore && <div className="text-gray-500 " onClick={() => setMore(m => !m)}>
                {more ? "less" : "more"}
            </div>}

        </div>
    );
}

export default DescriptionBox;