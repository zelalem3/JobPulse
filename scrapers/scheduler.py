from apscheduler.schedulers.blocking import BlockingScheduler

scheduler = BlockingScheduler()

scheduler.add_job(
    scrape_ethiojobs,
    "interval",
    hours=1
)

scheduler.start()