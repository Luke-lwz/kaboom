
function InfoBanner({ children, className, endElement, style, size = "md", onClick = () => {} }) {
    return (
        <div onClick={onClick} className={"  text-white rounded-xl w-full flex justify-between items-center text-title overflow-hidden " + (getSize(size)) + " " + className} style={style}>
            <div className="w-full h-full flex items-center truncate ">

            {children}
            </div>
            <div className="h-full flex items-center">
                {endElement}
            </div>
        </div>
    );

    function getSize(size) {
        switch (size) {
            case "sm":
                return "h-10 px-4 text-sm";
            case "lg":
                return "h-16 px-6 text-xl";
            case "md":
            default:
                return "h-12 px-4 text-base";
        }
    }
}

export default InfoBanner;