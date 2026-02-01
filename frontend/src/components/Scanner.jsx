import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const Scanner = ({ onScan }) => {
    const [manualId, setManualId] = useState('');
    const scannerRef = useRef(null);

    useEffect(() => {
        // Note: html5-qrcode can be finicky in React strict mode. 
        // Using a simpler approach: only init if container exists and not already scanning.
        // Ideally, use a library wrapper or careful cleanup.

        // For MVP, if the user explicitly wants to scan, we can render a button to start global scanner,
        // or just render the scanner immediately.

        // Using Html5QrcodeScanner for ease of UI
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
        );

        scanner.render((decodedText, decodedResult) => {
            onScan(decodedText);
            scanner.clear();
        }, (error) => {
            // ignore errors during scanning
        });

        return () => {
            scanner.clear().catch(err => console.error("Failed to clear scanner", err));
        };
    }, [onScan]);

    const handleManualSubmit = (e) => {
        e.preventDefault();
        if (manualId.trim()) {
            onScan(manualId.trim());
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Scan Barcode</h2>

            {/* Scanner Container */}
            <div id="reader" className="w-full mb-4"></div>

            <div className="w-full border-t border-gray-200 my-4"></div>

            {/* Manual Input Fallback */}
            <form onSubmit={handleManualSubmit} className="w-full flex gap-2">
                <input
                    type="text"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder="Enter Participant ID"
                    className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Go
                </button>
            </form>
        </div>
    );
};

export default Scanner;
