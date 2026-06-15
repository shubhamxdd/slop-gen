import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function diagnose() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  console.log('Testing ElevenLabs Connectivity...');
  console.log('API Key (masked):', apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'MISSING');

  try {
    console.log('2. Checking User Subscription and Usage...');
    const user = await axios.get('https://api.elevenlabs.io/v1/user', {
        headers: { 'xi-api-key': apiKey || '' }
    });
    const sub = user.data.subscription;
    console.log('✅ Success! User data retrieved.');
    console.log(`Plan: ${sub.tier}`);
    console.log(`Character Count: ${sub.character_count}`);
    console.log(`Character Limit: ${sub.character_limit}`);
    console.log(`Characters Remaining: ${sub.character_limit - sub.character_count}`);
    
    console.log('3. Testing Audio Generation with standard voice (George: JBFqnCBsd6RMkjVDRZzb)...');
    try {
        await axios.post('https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb', {
            text: 'Hello',
            model_id: 'eleven_flash_v2_5'
        }, {
            headers: { 'xi-api-key': apiKey || '' }
        });
        console.log('✅ Success! Standard voice is working.');
    } catch (e: any) {
        console.error('❌ Failed to use standard voice.');
        console.error('Status:', e.response?.status);
        console.error('Data:', JSON.stringify(e.response?.data));
    }
  } catch (error: any) {
    console.error('❌ Failed!');
    if (error.code) console.error('Error Code:', error.code);
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data));
    }
  }
}

diagnose();
