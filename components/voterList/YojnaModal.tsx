import React, { useEffect } from "react";

interface YojnaItem {
    id: number;
    yojna_id: number;
    yojna_name: string;
    regid: number;
    reg_name: string;
}

interface Props {
    data: YojnaItem[];
    onClose: () => void;
}

const YojnaModal: React.FC<Props> = ({ data, onClose }) => {

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEsc);

        return () => {
            document.removeEventListener("keydown", handleEsc);
        };
    }, [onClose]);


    // const schemes = [
    //     "आयुष्मान भारत योजना",
    //     "उच्चल्ला योजना",        // as per image: उच्चल्ला (not उज्ज्वला)
    //     "किसान सम्मान निर्देश",  // as per image: निर्देश (not निधि)
    //     "प्रधानमंत्री आवास योजना",
    //     "प्रधानमंबरी जन धन योजना", // as per image: प्रधानमंबरी (typo preserved)
    //     "बेटी बचाई बेटी पढ़ाई",   // as per image: बचाई पढ़ाई (not बचाओ पढ़ाओ)
    //     "मनरेगा योजना",
    //     "सौभाग्य योजना",
    //     "स्वच्छ भारत अभियान"
    // ];

    const schemes = Array.from(
        new Set(data.map((item) => item.yojna_name))
    );

    const checkStatus = (name: string, regid: number) => {
        return data.some(
            (d) => d.yojna_name === name && d.regid === regid
        );
    };

    return (
        <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center p-4">
            {/* Modal container - styled to match image layout */}
            <div className="bg-white rounded shadow-xl w-full max-w-2xl text-black">
                {/* Header with title and close button exactly as image */}
                <div className="flex justify-between items-center px-6 py-1.5 border-b border-gray-300">
                    <span className="text-lg font-semibold">योजना चयन</span>
                    <div className="flex w-md">
                        <select
                            name="reg_select"
                            id="reg_select"
                            className="w-64 cursor-pointer py-2 border border-gray-300 rounded-md shadow-sm 
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
               bg-white text-gray-700"
                        >
                            <option value="">Select register</option>
                            <option value="1">Register 1</option>
                            <option value="2">Register 2</option>
                            <option value="3">Register 3</option>
                        </select>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-600 hover:text-black text-xl font-bold cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Table area with proper borders */}
                <div className="p-3">
                    <table className="w-full border-collapse border border-gray-400 text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-400 px-3 py-1 text-left font-semibold">योजना</th>
                                <th className="border border-gray-400 px-3 py-1 text-left font-semibold">लाभान्वित</th>
                                <th className="border border-gray-400 px-3 py-1 text-left font-semibold">पत्र</th>
                                <th className="border border-gray-400 px-3 py-1 text-left font-semibold">अपत्र</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schemes.map((scheme: any, i: any) => (
                                <tr key={i} className="even:bg-gray-50">

                                    <td className="border border-gray-400 px-3 py-1">
                                        {scheme}
                                    </td>

                                    <td className="border border-gray-400 px-3 py-1 text-center">
                                        <input
                                            type="checkbox"
                                            checked={checkStatus(scheme, 1)}
                                            readOnly
                                            className="w-4 h-4 accent-blue-600"
                                        />
                                    </td>

                                    <td className="border border-gray-400 px-3 py-1 text-center">
                                        <input
                                            type="checkbox"
                                            checked={checkStatus(scheme, 2)}
                                            readOnly
                                            className="w-4 h-4 accent-blue-600"
                                        />
                                    </td>

                                    <td className="border border-gray-400 px-3 py-1 text-center">
                                        <input
                                            type="checkbox"
                                            checked={checkStatus(scheme, 3)}
                                            readOnly
                                            className="w-4 h-4 accent-blue-600"
                                        />
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer with Cancel and Save buttons exactly as image */}
                <div className="flex justify-end gap-3 px-6 py-1 border-t border-gray-300">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" className="mt-[1px] cursor-pointer" />
                        <span className="leading-none">परिवार सर्वे</span>
                    </label>
                    <button className="save-btn px-5 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default YojnaModal;