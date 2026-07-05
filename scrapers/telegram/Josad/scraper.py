import os
import sys
import asyncio
from pathlib import Path
from telethon import TelegramClient
from dotenv import load_dotenv

# --- FIX 1: Explicitly find the .env file relative to this script ---
# This ensures it works even if you run it from different folders
base_dir = Path(__file__).resolve().parent
load_dotenv(dotenv_path=base_dir / ".env")

# --- FIX 2: Safely read and cast the variables --
api_id_raw = os.getenv("API_ID")
api_hash = os.getenv("API_HASH")

if not api_id_raw or not api_hash:
    print("Error: API_ID or API_HASH not found in environment variables.")
    print(f"Looked inside: {base_dir / '.env'}")
    sys.exit(1)


api_id = int(api_id_raw) 


# Initialize the client
client = TelegramClient("jobpulse", api_id, api_hash)

async def job_scraper():
    channel = "josad_software"
    jobs_list = []

    async with client:

        async for message in client.iter_messages(channel, limit=20):
            if message.text:
                print(message.date)
                print(message.text)
                print("-" * 50)
                jobs_list.append(message) 
                
    return jobs_list

if __name__ == "__main__":
    asyncio.run(job_scraper())