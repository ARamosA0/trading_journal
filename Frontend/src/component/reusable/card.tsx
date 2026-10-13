
type CardProps = {
    icon?: string;
    iconSvg?: React.ReactNode;
    title: string;
    description?: string;
    img?: string;
    btnText?: string;
    titleVersion?: number;
    descriptionVersion?: number;
    width?: "sm" | "md" | "lg" | "xl";
    high?: number;
    haveHover?: boolean;
};

const widthMap = {
    sm: "sm:w-40",
    md: "sm:w-90",
    lg: "sm:w-150",
    xl: "sm:w-250",
};

const textPosition: Record<number, string> = {
    1: "text-left",
    2: "text-center",
    3: "text-right",
}

function Card (card: CardProps) {
    const alignment = textPosition[card.descriptionVersion ?? 1] || textPosition[1];
    const width = widthMap[card.width ?? "lg"] || widthMap.lg;

    return (
        <div className={`
            flex flex-col 
            ${alignment}
            w-full 
            ${width}
            py-6
            h-${card.high || "50"}
            rounded-lg
            border
            border-border2
            bg-bg4
            p-6
            shadow-md
            transition-all
            duration-300
            bg-bg3
            ${card.haveHover ? "hover:border-[var(--purple)]" : ""}
            ${card.haveHover ? "hover:-translate-y-1" : ""}
            ${card.haveHover ? "hover:shadow-xl" : ""}
            `}>

           {
            card.iconSvg ? (
                <div className="mb-4">
                    {card.iconSvg}
                </div>
            ) : (
                <div className="mb-4">
                    <img src={card.icon} alt={card.title} className="w-12 h-12" />
                </div>
            )
           }

            <h2 className="text-xl font-semibold mb-4">{card.title}</h2>
            <p className="text-text2">{card.description}</p>
            {card.btnText && (
                <a className="mt-4 px-4 py-2 bg-bg4 text-[var(--text)] rounded-lg hover:bg-[var(--bg4)] transition-colors border border-[var(--border)] hover:border-[var(--purple-dim)]">
                    {card.btnText}
                </a>
            )}
        </div>
    );
}

export default Card;
