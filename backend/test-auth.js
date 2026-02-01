require('dotenv').config();
const { google } = require('googleapis');

async function testAuth() {
    console.log("--- DEBUG START ---");
    try {
        const rawKey = process.env.GOOGLE_PRIVATE_KEY;
        const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

        console.log(`Email exists? ${!!email}`);
        console.log(`Key exists? ${!!rawKey}`);

        if (rawKey) {
            console.log(`Raw Key Type: ${typeof rawKey}`);
            console.log(`Raw Key Length: ${rawKey.length}`);
            console.log(`Raw Key First 50 chars: ${JSON.stringify(rawKey.substring(0, 50))}`);

            // Check if it starts with quote
            if (rawKey.startsWith('"')) {
                console.log("WARNING: Key starts with quote!");
            }
        }

        if (!rawKey) {
            console.log("❌ RAW KEY IS MISSING or EMPTY");
            return;
        }

        // Attempt fix
        let fixedKey = rawKey;
        // Remove surrounding quotes if somehow present (dotenv usually handles this, but just in case)
        if (fixedKey.startsWith('"') && fixedKey.endsWith('"')) {
            fixedKey = fixedKey.slice(1, -1);
        }

        // Replace literal \n with actual newlines
        fixedKey = fixedKey.replace(/\\n/g, '\n');

        console.log(`Fixed Key First 50 chars: ${JSON.stringify(fixedKey.substring(0, 50))}`);

        const auth = new google.auth.JWT(
            email,
            null,
            fixedKey,
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        console.log("Authorizing...");
        await auth.authorize();
        console.log("✅ AUTH SUCCESS!");

    } catch (error) {
        console.error("❌ ERROR:");
        console.error(error.message);
    }
    console.log("--- DEBUG END ---");
}

testAuth();
