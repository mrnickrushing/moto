import os, json, urllib.request

base = os.environ["INTEGRATION_PROXY_URL"]
job_id = "649a27b5-d56a-464c-b478-87669c5cab4f"
key = "sk-emergent-aF3A418891b950b07A"
req = urllib.request.Request(
    base + "/stripe/sandboxes",
    data=json.dumps({"job_id": job_id}).encode(),
    headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"},
    method="POST",
)
with urllib.request.urlopen(req) as r:
    sandbox = json.load(r)
print(json.dumps(sandbox, indent=2))
