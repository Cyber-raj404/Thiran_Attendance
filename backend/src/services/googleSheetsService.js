const { google } = require('googleapis');

// --- Mock Data (Fallback) ---
let mockParticipants = [
    {
        id: 'BK2026001', name: 'Alice Johnson', email: 'alice@example.com', mobile: '9876543210',
        college: 'Tech University', department: 'CSE', rollNo: 'CSE-101',
        events: { day1: 'Hackathon Keynote', day2: 'Coding Marathon', day3: 'Project Expo' },
        attendance: { day1_fn: 'ABSENT', day1_an: 'ABSENT', day2_fn: 'ABSENT', day2_an: 'ABSENT', day3_fn: 'ABSENT', day3_an: 'ABSENT' }
    },
    {
        id: 'BK2026002', name: 'Bob Smith', email: 'bob@example.com', mobile: '9876543211',
        college: 'Engineering College', department: 'IT', rollNo: 'IT-202',
        events: { day1: 'Workshop A', day2: 'Coding Marathon', day3: 'Closing Ceremony' },
        attendance: { day1_fn: 'PRESENT', day1_an: 'ABSENT', day2_fn: 'ABSENT', day2_an: 'ABSENT', day3_fn: 'ABSENT', day3_an: 'ABSENT' }
    },
    {
        id: 'BK2026003', name: 'Charlie Brown', email: 'charlie@example.com', mobile: '9876543212',
        college: 'Arts & Science', department: 'Physics', rollNo: 'PHY-303',
        events: { day1: 'Seminar', day2: 'Seminar', day3: 'Seminar' },
        attendance: { day1_fn: 'ABSENT', day1_an: 'ABSENT', day2_fn: 'ABSENT', day2_an: 'ABSENT', day3_fn: 'ABSENT', day3_an: 'ABSENT' }
    },
];

// --- Real Google Sheets Setup ---
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const getAuthClient = () => {
    const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY } = process.env;
    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) return null;

    // Clean the key (handle escaped newlines and potential surrounding quotes)
    let privateKey = GOOGLE_PRIVATE_KEY;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    return new google.auth.JWT({
        email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: privateKey,
        scopes: SCOPES
    });
};

const sheets = google.sheets({ version: 'v4' });

// Helper to find column index (0-based) by header name
const findColumnIndex = (headerRow, columnName) => {
    const index = headerRow.indexOf(columnName);
    return index === -1 ? null : index;
};

// Map Sheet Data to App Schema
const mapRowToParticipant = (row, headers, sheetName) => {
    const getCol = (name) => {
        const idx = findColumnIndex(headers, name);
        return idx !== null && row[idx] ? row[idx] : '';
    };

    // Extract basics (Common across sheets)
    const id = getCol('Booking ID') || getCol('Unique ID');
    if (!id) return null; // Skip empty rows

    const name = getCol('Name');
    const email = getCol('Email');
    const mobile = getCol('Mobile Number');
    const college = getCol('College Name');
    const dept = getCol('Department');
    const rollNo = getCol('Roll No');

    // Event Name Fallback
    let eventName = '';
    if (sheetName === 'Day 1') eventName = getCol('Event Name');
    else if (sheetName === 'Day 2') eventName = getCol('Event Name') || getCol('Event Name');
    else if (sheetName === 'Day 3') eventName = getCol('Event Name') || getCol('Event Name');

    const attData = {};

    const setAtt = (key, colName) => {
        const val = getCol(colName);
        attData[key] = val ? val.toUpperCase() : 'ABSENT';
    };

    if (sheetName === 'Day 1') {
        setAtt('day1_fn', 'Day 1 FN');
        setAtt('day1_an', 'Day 1 AN');
    } else if (sheetName === 'Day 2') {
        setAtt('day2_fn', 'Day 2 FN');
        setAtt('day2_an', 'Day 2 AN');
    } else if (sheetName === 'Day 3') {
        setAtt('day3_fn', 'Day 3 FN');
        setAtt('day3_an', 'Day 3 AN');
    }

    return {
        id, name, email, mobile, college, department: dept, rollNo,
        events: { [sheetName.toLowerCase().replace(' ', '')]: eventName },
        attendance: attData,
        _sheetName: sheetName,
        _rowIndex: -1
    };
};

const getParticipantById = async (id) => {
    const auth = getAuthClient();
    if (!auth) {
        console.log(`[MOCK] Fetching participant ${id}`);
        return mockParticipants.find(p => p.id.toLowerCase() === id.toLowerCase()) || null;
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const targetId = id.toLowerCase();

    try {
        const sheetNames = ['Day 1', 'Day 2', 'Day 3'];
        let mergedParticipant = null;

        for (const sheetName of sheetNames) {
            try {
                const resp = await sheets.spreadsheets.values.get({
                    auth, spreadsheetId, range: sheetName
                });

                const rows = resp.data.values;
                if (!rows || rows.length === 0) continue;

                const headers = rows[0];
                const idIdx = findColumnIndex(headers, 'Booking ID');
                if (idIdx === null) continue;

                const rowIdx = rows.findIndex((r, i) => i > 0 && r[idIdx] && r[idIdx].toLowerCase() === targetId);

                if (rowIdx !== -1) {
                    const pData = mapRowToParticipant(rows[rowIdx], headers, sheetName);
                    if (pData) {
                        pData._rowIndex = rowIdx + 1;

                        if (!mergedParticipant) {
                            mergedParticipant = pData;
                        } else {
                            mergedParticipant.events = { ...mergedParticipant.events, ...pData.events };
                            mergedParticipant.attendance = { ...mergedParticipant.attendance, ...pData.attendance };
                        }
                    }
                }
            } catch (err) {
                console.warn(`[WARN] Could not fetch sheet '${sheetName}': ${err.message}`);
                // Continue to next sheet (ignore missing sheets)
            }
        }

        return mergedParticipant;

    } catch (error) {
        console.error("Google Sheets API Error:", error);
        return null;
    }
};

// Basic In-Memory Cache
let participantsCache = null;
let lastCacheTime = 0;
const CACHE_DURATION = 60 * 1000; // 60 Seconds

const getAllParticipants = async () => {
    const auth = getAuthClient();
    if (!auth) {
        console.log(`[MOCK] Fetching all participants`);
        return mockParticipants;
    }

    // Check Cache
    const now = Date.now();
    if (participantsCache && (now - lastCacheTime < CACHE_DURATION)) {
        console.log('[CACHE] Returning cached participants');
        return participantsCache;
    }

    try {
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const sheetNames = ['Day 1', 'Day 2', 'Day 3'];

        console.log('[API] Fetching sheets in parallel...');
        // Parallel Fetching using Promise.all
        const sheetsRequests = sheetNames.map(sheetName =>
            sheets.spreadsheets.values.get({ auth, spreadsheetId, range: sheetName })
                .then(res => ({ sheetName, data: res.data }))
                .catch(err => {
                    console.warn(`[WARN] Skipping sheet '${sheetName}': ${err.message}`);
                    return { sheetName, data: null };
                })
        );

        const responses = await Promise.all(sheetsRequests);

        // Map to store merged participants by ID
        const participantsMap = new Map();

        responses.forEach(({ sheetName, data }) => {
            if (!data) return;
            const rows = data.values;
            if (!rows || rows.length === 0) return;

            const headers = rows[0];

            for (let i = 1; i < rows.length; i++) {
                const p = mapRowToParticipant(rows[i], headers, sheetName);
                if (p && p.id) {
                    const idLower = p.id.toLowerCase();
                    if (!participantsMap.has(idLower)) {
                        participantsMap.set(idLower, p);
                    } else {
                        // Merge logic
                        const existing = participantsMap.get(idLower);
                        // Update Events (e.g., add day2 event)
                        existing.events = { ...existing.events, ...p.events };
                        // Update Attendance
                        existing.attendance = { ...existing.attendance, ...p.attendance };
                    }
                }
            }
        });

        const result = Array.from(participantsMap.values());

        // Update Cache
        participantsCache = result;
        lastCacheTime = now;
        console.log(`[API] Fetched ${result.length} participants and cached.`);

        return result;

    } catch (error) {
        console.error("Google Sheets API Error:", error);
        return [];
    }
};

const markAttendance = async (id, sessionId, status) => {
    const auth = getAuthClient();
    if (!auth) {
        console.log(`[MOCK] Marking attendance for ${id} in ${sessionId} as ${status}`);
        const participant = mockParticipants.find(p => p.id.toLowerCase() === id.toLowerCase());
        if (participant) {
            if (!participant.attendance) participant.attendance = {};
            participant.attendance[sessionId] = status;
            return participant;
        }
        return null;
    }

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const dayMap = { 'day1': 'Day 1', 'day2': 'Day 2', 'day3': 'Day 3' };
    const [dayKey, slot] = sessionId.split('_');
    const sheetName = dayMap[dayKey];

    if (!sheetName) return null;

    try {
        const range = sheetName;
        const resp = await sheets.spreadsheets.values.get({
            auth, spreadsheetId, range
        });
        const rows = resp.data.values;
        const headers = rows[0];

        const idIdx = findColumnIndex(headers, 'Booking ID');
        if (idIdx === null) throw new Error("Booking ID column not found");

        const targetId = id.toLowerCase();
        const dataRowIndex = rows.findIndex((r, i) => i > 0 && r[idIdx] && r[idIdx].toLowerCase() === targetId);

        if (dataRowIndex === -1) return null;

        const sheetRowNumber = dataRowIndex + 1;

        const colNameMap = {
            'day1_fn': 'Day 1 FN', 'day1_an': 'Day 1 AN',
            'day2_fn': 'Day 2 FN', 'day2_an': 'Day 2 AN',
            'day3_fn': 'Day 3 FN', 'day3_an': 'Day 3 AN'
        };
        const targetColName = colNameMap[sessionId];
        let colIndex = findColumnIndex(headers, targetColName);

        if (colIndex === null) {
            throw new Error(`Column '${targetColName}' not found in ${sheetName}`);
        }

        const getColumnLetter = (col) => {
            let letter = '';
            while (col >= 0) {
                letter = String.fromCharCode((col % 26) + 65) + letter;
                col = Math.floor(col / 26) - 1;
            }
            return letter;
        };

        const colLetter = getColumnLetter(colIndex);
        const cellRange = `${sheetName}!${colLetter}${sheetRowNumber}`;

        await sheets.spreadsheets.values.update({
            auth, spreadsheetId, range: cellRange,
            valueInputOption: 'RAW',
            resource: { values: [[status]] }
        });

        // Invalidate Cache and Updated locally if possible (ideal)
        // For now, simple clear is enough
        participantsCache = null;
        lastCacheTime = 0;

        return await getParticipantById(id);

    } catch (error) {
        console.error("Error marking attendance:", error);
        return null;
    }
};

module.exports = {
    getParticipantById,
    getAllParticipants,
    markAttendance
};
