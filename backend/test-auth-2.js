const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

function log(msg) {
    fs.appendFileSync('debug2.log', msg + '\n');
}

async function run() {
    try {
        fs.writeFileSync('debug2.log', '--- START ---' + new Date().toISOString() + '\n');

        const envPath = path.join(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');

        let email = '';
        let key = '';

        envContent.split('\n').forEach(line => {
            if (line.startsWith('GOOGLE_SERVICE_ACCOUNT_EMAIL=')) {
                email = line.split('=')[1].trim();
                if (email.startsWith('"') && email.endsWith('"')) email = email.slice(1, -1);
            }
            if (line.startsWith('GOOGLE_PRIVATE_KEY=')) {
                key = line.split('=')[1].trim();
                if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
            }
        });

        const fixedKey = key.replace(/\\n/g, '\n');

        log('Attempt 1: Positional Arguments');
        try {
            const auth1 = new google.auth.JWT(
                email,
                null,
                fixedKey,
                ['https://www.googleapis.com/auth/spreadsheets']
            );
            await auth1.authorize();
            log('SUCCESS 1: Positional work!');
        } catch (e) {
            log(`FAIL 1: ${e.message}`);
        }

        log('Attempt 2: Object Argument');
        try {
            const auth2 = new google.auth.JWT({
                email: email,
                key: fixedKey,
                scopes: ['https://www.googleapis.com/auth/spreadsheets']
            });
            await auth2.authorize();
            log('SUCCESS 2: Object works!');
        } catch (e) {
            log(`FAIL 2: ${e.message}`);
        }

    } catch (err) {
        log(`CRITICAL ERROR: ${err.message}`);
    }
}

run();
