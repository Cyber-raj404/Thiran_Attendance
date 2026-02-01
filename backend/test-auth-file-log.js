const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

function log(msg) {
    fs.appendFileSync('debug.log', msg + '\n');
}

async function run() {
    try {
        fs.writeFileSync('debug.log', '--- START ---\n');

        // Manual .env parsing
        const envPath = path.join(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        log(`Env content length: ${envContent.length}`);

        let email = '';
        let key = '';

        envContent.split('\n').forEach(line => {
            if (line.startsWith('GOOGLE_SERVICE_ACCOUNT_EMAIL=')) {
                email = line.split('=')[1].trim();
                // strip quotes
                if (email.startsWith('"') && email.endsWith('"')) email = email.slice(1, -1);
            }
            if (line.startsWith('GOOGLE_PRIVATE_KEY=')) {
                key = line.split('=')[1].trim();
                // strip quotes
                if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
            }
        });

        log(`Email found: ${email}`);
        log(`Key found (raw length): ${key.length}`);

        // Fix key
        const fixedKey = key.replace(/\\n/g, '\n');
        log(`Fixed Key length: ${fixedKey.length}`);
        log(`Fixed Key Start: ${JSON.stringify(fixedKey.substring(0, 50))}`);

        const auth = new google.auth.JWT(
            email,
            null,
            fixedKey, // Pass fixed key
            ['https://www.googleapis.com/auth/spreadsheets']
        );

        log('Authorizing...');
        await auth.authorize();
        log('SUCCESS: Authorized!');

    } catch (err) {
        log(`ERROR: ${err.message}`);
        log(`Stack: ${err.stack}`);
    }
}

run();
