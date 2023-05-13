import { QRCode } from 'react-qrcode'

function QRCodeMenu({ href = "", code }) {
    return (
        <div className="w-fit max-w-[20rem] h-fit bg-base-100 rounded-3xl p-4 flex justify-center">
            <div className="bg-neutral w-fit h-full rounded-2xl flex flex-col justify-start items-center p-4">
                <div className="w-fit bg-base-100 flex flex-col items-center rounded-lg overflow-hidden">
                    <QRCode value={href} scale="6" />

                </div>
                <h1 className='p-2 px-4 mt-7 mb-5 bg-base-100 rounded-lg text-4xl text-title text-secondary'>
                    {code}
                </h1>
            </div>
        </div>
    );
}

export default QRCodeMenu;