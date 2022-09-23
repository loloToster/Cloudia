import json
import subprocess
import sys

OMITTED_PACKAGES = ["sqlite3"]

with open("package.json") as f:
    package_json = json.load(f)

dependencies = package_json["dependencies"]
dev_dependencies = package_json["devDependencies"]

install_command = ["npm", "i"]

install_command += [d for d in dependencies if not d in OMITTED_PACKAGES]
install_command += [d for d in dev_dependencies if not d in OMITTED_PACKAGES]

print("Executing: " + " ".join(install_command))
subprocess.run(install_command, stdout=sys.stdout, stderr=sys.stderr)
