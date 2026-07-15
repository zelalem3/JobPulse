import os
import sys
from telethon import TelegramClient
from dotenv import load_dotenv

load_dotenv()

api_id = os.getenv("API_ID")
api_hash = os.getenv("API_HASH")

client = TelegramClient("jobpulse", api_id, api_hash)

async def job_scraper():
    channel = "jobs_in_ethio"
    jobs_list = []

    async with client:
        async for message in client.iter_messages(channel, limit=20):
            print(message.date)
            print(message.text)
            print("-" * 50)
            
            
            if message.text:
                jobs_list.append(message) 
                
    return jobs_list


if __name__ == "__main__":
    import asyncio
    asyncio.run(job_scraper())