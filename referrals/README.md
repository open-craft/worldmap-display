
# Referrals statistics

## How it works

The idea is using a 1px image and S3 logs to detect total visits to the survey and map, and on the other side visits to the edX pages that embed them.

We tag a 1px image with a query string that will be logged and use it on edX (to count the via-edX visits) and in the survey (to count the total survey visits). We count the total map visits by just looking for the map data JSON filename (`data.json` if you use `?json=data.json` in the map `iframe` tag).

## Setup

Upload a 1px transparent image on S3 alongside the map static assets and make it public. Turn S3 logging on with the default format.

**Important**: Don't use the "website" url, but the REST one you can get in the control panel, `x-` query strings are not supported in WEBSITE logs. For the README we will use this location for the 1px image:

```
https://s3.amazonaws.com/harvard-atlas-demo/stat.png
```

1. Embed the 1px image on the Qualtrics survey: from the Qualtrics control panel edit the body of a question in HTML mode and append this (choose a NAME unique to the survey):

```
<img src="https://s3.amazonaws.com/harvard-atlas-demo/stat.png?x-atlas-analytics=NAME-qualtrics-survey" />
```

2. Embed the same image with a different query string on edX from Studio next to the survey `iframe`:

```
<img src="https://s3.amazonaws.com/harvard-atlas-demo/stat.png?x-atlas-analytics=NAME-edx-survey" />
```

3. and next to the map `iframe` (again with a different query string)

```
<img src="https://s3.amazonaws.com/harvard-atlas-demo/stat.png?x-atlas-analytics=NAME-edx-map" />
```

## Generating the stats

Download the S3 logs (will be many files, you don't need to merge them) in a folder on your local system, fill out the sample config.yml with the names you picked above and run

```
./referrals.py config.yml
```
