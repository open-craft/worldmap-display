#!/usr/bin/env python3

import arrow
import yaml
import sys
import os
import os.path
import re

LINE_REGEX_STRING  = (r'(\S+) (\S+) \[(.*?)\] (\S+) (\S+) '
r'(\S+) (\S+) (\S+) "([^"]+)" (\S+) (\S+) (\S+) (\S+) (\S+) (\S+) '
r'"([^"]+)" "([^"]+)" (\S+)')
LINE_REGEX_COMPILED = re.compile(LINE_REGEX_STRING)
FIELD_NAMES = ('bucket_owner', 'bucket', 'datetime', 'ip', 'requestor_id',
'request_id', 'operation', 'key', 'http_method_uri_proto', 'http_status',
's3_error', 'bytes_sent', 'object_size', 'total_time', 'turn_around_time',
'referer', 'user_agent', 'version_id')
def parse_line(line):
    match = LINE_REGEX_COMPILED.match(line)
    if not match:
        return
    return dict(zip(FIELD_NAMES, match.groups()))

if len(sys.argv) != 2:
    print("Usage: referrals.py config.yml")
    sys.exit(1)

with open(sys.argv[1]) as f:
    config = yaml.load(f.read())

start = arrow.get(config["start"])
logs_location = os.path.expanduser(config["logs_location"])

STRINGS = {}
for resource in config["resources"]:
    STRINGS[resource["direct"]] = 0
    STRINGS[resource["embedded"]] = 0

for filename in os.listdir(logs_location):
    with open(os.path.join(logs_location, filename)) as f:
        for line in f:
            entry = parse_line(line)
            if not entry:
                continue
            if arrow.get(entry['datetime'], 'DD/MMM/YYYY:HH:mm:ss Z') < start:
                continue

            for string in STRINGS:
                if string in entry['http_method_uri_proto']:
                    STRINGS[string] += 1

for resource in config["resources"]:
    direct = STRINGS[resource["direct"]]
    embedded = STRINGS[resource["embedded"]]
    print("### {}".format(resource["name"]))
    print("Embedded views: {}".format(embedded))
    print("Total views: {}".format(direct))
    print("Embedded views are {:.1%}".format(embedded/direct))
    print()
