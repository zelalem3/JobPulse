import os
import sys
from telethon import TelegramClient
from dotenv import load_dotenv

load_dotenv()

api_id = os.getenv("API_ID")
api_hash = os.getenv("API_HASH")


client = TelegramClient("jobpulse", api_id, api_hash)



async def job_scraper(client):
    channel = "josad_software" # Targeted channel
    jobs_list = []

    async with client:
        print(f"Successfully connected! Fetching messages from @{channel}...")
        async for message in client.iter_messages(channel, limit=20):
            if message.text:
                print(f"Date: {message.date}")
                print(message.text)
                print("-" * 50)
                jobs_list.append(message) 
    return jobs_list