import requests
import json

def get_all_jobs(offset=0):
    url = "https://api.afriworket.com/v1/graphql"
    
    
    headers = {
        "accept": "application/json",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        "origin": "https://afriworket.com",
        "referer": "https://afriworket.com/",
        "x-hasura-role": "anonymous"
    }

    
    payload = {
        "operationName": "GetAllJobs",
        "query": """
        query GetAllJobs($offset: Int!, $whereCondition: jobs_bool_exp!, $orderCondition: [jobs_order_by!]) {
          jobs(
            order_by: $orderCondition
            offset: $offset
            limit: 30
            where: $whereCondition
          ) {
            id
            title
            created_at
            updated_at
            published_at
            refreshed_at
            approval_status
            description
            job_type
            job_site
            skill_requirements {
              skill {
                name
                id
              }
            }
            city {
              name
              country {
                name
              }
            }
            sectors {
              sector {
                name
                id
              }
            }
            deadline
            compensation_amount_cents
            compensation_type
            compensation_currency
            experience_level
            entity {
              type
              name
            }
          }
        }
        """,
        "variables": {
            "offset": offset,
            "orderCondition": {"latest_activity_at": "desc"},
            "whereCondition": {
                "_and": [
                    {"approval_status": {"_in": ["PUBLISHED", "REFRESHED"]}}
                ]
            }
        }
    }

    try:
        # GraphQL requests over HTTP must always use POST method
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            # Extract the actual list of jobs from the Hasura GraphQL nesting
            jobs = data.get("data", {}).get("jobs", [])
            return jobs
        else:
            print(f"Failed to fetch data. Status Code: {response.status_code}")
            print(response.text)
            return []
            
    except Exception as e:
        print(f"An error occurred: {e}")
        return []

# Test the script execution
if __name__ == "__main__":
    print("Fetching jobs from Afriwork API...")
    job_list = get_all_jobs(offset=0)
    
    print(f"Successfully retrieved {len(job_list)} jobs.\n")
    
    for job in job_list:
        title = job.get("title")
        company = job.get("entity", {}).get("name", "N/A")
        id = job.get("id")
     