import useLocalStorage from "use-local-storage";
import { useMemo } from "react"

const MONEY_NEEDED = 14;

function PaymentInfo(props) {

    const [moneyDonated, setMoneyDonated] = useLocalStorage('moneyDonated', 0);

    const [progressColorBasedOnMoney, textColorBasedOnMoney, btnColorBasedOnMoney, buttonText] = useMemo(() => {
        if (moneyDonated <= MONEY_NEEDED / 2) return ["progress-primary", "text-primary", "btn-primary", "Donate"]
        if (moneyDonated >= MONEY_NEEDED) return ["progress-success", "text-success", "btn-success", "Support more"]
        return ["progress-warning", "text-warning", "btn-warning", "Donate"]
    }, [moneyDonated])

    return (
        <div className='w-full border-2 border-neutral rounded-xl p-2 flex flex-col gap-2'>
            <div className="flex w-full items-center gap-2">
                <h1 className="text-5xl font-extrabold tracking-tighter">
                    <span className={" " + textColorBasedOnMoney}>{moneyDonated}</span> <span className="text-base-content/40">/</span> {MONEY_NEEDED} <span className="text-2xl -ml-2">$</span>
                    <div className="text-2xl  "> server costs covered this month</div>
                </h1>
            </div>
            <progress class={"progress w-full " + progressColorBasedOnMoney} value={moneyDonated} max={MONEY_NEEDED}></progress>
            <a href="https://www.buymeacoffee.com/lukas.fish" target="_blank" className={"btn noskew font-extrabold text-base-100 " + btnColorBasedOnMoney}>{buttonText}</a>
        </div>
    );
}

export default PaymentInfo;